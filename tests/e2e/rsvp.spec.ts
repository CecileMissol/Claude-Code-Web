import { execFileSync } from 'node:child_process';
import { createHmac, randomBytes } from 'node:crypto';
import { expect, test, type APIRequestContext, type BrowserContext } from '@playwright/test';

/**
 * Publication → public invitation → RSVP → dashboard, end to end.
 *
 * ## How to run it
 *
 * `pnpm test:e2e` — nothing else. This journey needs the D1 binding, which
 * only exists when the server runs through `initOpenNextCloudflareForDev()`,
 * and `playwright.config.ts` now starts `next dev` with a single worker for
 * exactly that reason (phase 8; it used to run against `next start`, which has
 * no bindings, and the spec skipped itself).
 *
 * The fixtures are written straight into the local D1 database with
 * `wrangler d1 execute --local`, the same tool that applies the migrations.
 * Every row is namespaced by the Playwright project and the worker index, so the
 * three viewports can run in parallel without stepping on each other, and the
 * rows are removed afterwards.
 *
 * The static theme of phase 2 has no working RSVP form (its `<form>` posts
 * nowhere), so the reply is sent with Playwright's `request.post`, which is
 * exactly what the animated theme will do through `submitRsvp`.
 *
 * Everything here goes through plain forms and server actions, so the journey
 * is also a check that the share page works **without JavaScript** — which is
 * how it behaves in a sandbox where Turbopack's HMR socket cannot connect and
 * the client never bootstraps.
 */

const SECRET = process.env.BETTER_AUTH_SECRET ?? 'dev-only-insecure-secret-change-me';
const SESSION_COOKIE = 'better-auth.session_token';

function sql(command: string): string {
  return execFileSync(
    'pnpm',
    [
      'exec',
      'wrangler',
      'd1',
      'execute',
      'invitations-db',
      '--local',
      '--json',
      '--command',
      command,
    ],
    { stdio: ['ignore', 'pipe', 'pipe'], cwd: process.cwd(), encoding: 'utf8' },
  );
}

/** First column of the first row, or `null` when the query returned nothing. */
function scalar(command: string): string | null {
  const raw = sql(command);
  const json = raw.slice(raw.indexOf('['));
  const results = (JSON.parse(json) as { results?: Record<string, unknown>[] }[])[0]?.results ?? [];
  const first = results[0];
  return first ? String(Object.values(first)[0]) : null;
}

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Better Auth stores the raw token in the database and signs the cookie. */
function signedSessionCookie(token: string): string {
  const signature = createHmac('sha256', SECRET).update(token).digest('base64');
  return encodeURIComponent(`${token}.${signature}`);
}

interface Fixture {
  suffix: string;
  userId: string;
  /** Row of `themes`: the seeded one when it exists, otherwise one of our own. */
  themeId: string;
  ownsTheme: boolean;
  invitationId: string;
  slug: string;
  /** A second, unpublished invitation, used to exercise the publish button. */
  draftId: string;
  draftSlug: string;
  sessionToken: string;
  email: string;
}

const THEME_SLUG = 'mariage-noir-ivoire';

function makeFixture(suffix: string): Fixture {
  const existing = scalar(`select id from themes where slug = ${quote(THEME_SLUG)} limit 1;`);

  return {
    suffix,
    userId: `e2e-user-${suffix}`,
    themeId: existing ?? `e2e-theme-${suffix}`,
    ownsTheme: existing === null,
    invitationId: `e2e-invitation-${suffix}`,
    slug: `e2e-zoe-et-dylan-${suffix}`,
    draftId: `e2e-draft-${suffix}`,
    draftSlug: `e2e-alex-and-sam-${suffix}`,
    sessionToken: randomBytes(24).toString('hex'),
    email: `e2e-${suffix}@example.test`,
  };
}

function content(slug: string) {
  return {
    version: 1,
    locale: 'fr',
    eventType: 'wedding',
    couple: { partner1: { firstName: 'Zoé' }, partner2: { firstName: 'Dylan' } },
    event: { date: '2027-06-12', time: '14:30', timezone: 'Europe/Paris' },
    venue: {
      name: 'Le domaine',
      addressLine: 'Chemin des oliviers',
      city: 'Lourmarin',
      photoSlot: 'venue',
    },
    photos: {},
    story: { lines: [`Une histoire pour ${slug}.`], photoSlots: [] },
    dateChapter: { lines: ['{date}.'], highlight: 'le grand jour' },
    program: { lines: [], items: [{ time: '14:30', title: 'Cérémonie' }] },
    place: { lines: [] },
    info: [],
    rsvp: {
      enabled: true,
      maxGuestsPerReply: 5,
      askEmail: true,
      askDiet: true,
      askMessage: true,
      notifyByEmail: false,
    },
    signature: { text: 'À très vite' },
    style: { paletteId: 'noir', scriptId: 'pinyon' },
    extras: {},
  };
}

function seed(fixture: Fixture): void {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 60 * 60 * 24 * 30;

  sql(
    [
      `insert into user (id, name, email, email_verified, created_at, updated_at)`,
      `values (${quote(fixture.userId)}, 'E2E', ${quote(fixture.email)}, 1, ${now}, ${now});`,
      `insert into session (id, expires_at, token, created_at, updated_at, user_id)`,
      `values (${quote(`e2e-session-${fixture.suffix}`)}, ${expires}, ${quote(fixture.sessionToken)}, ${now}, ${now}, ${quote(fixture.userId)});`,
      ...(fixture.ownsTheme
        ? [
            `insert into themes (id, slug, name, version, status, created_at)`,
            `values (${quote(fixture.themeId)}, ${quote(THEME_SLUG)}, 'Noir & ivoire', 1, 'active', ${now});`,
          ]
        : []),
      `insert into invitations (id, owner_id, theme_id, slug, locale, content, content_version, status, published_at, expires_at, created_at, updated_at)`,
      `values (${quote(fixture.invitationId)}, ${quote(fixture.userId)}, ${quote(fixture.themeId)}, ${quote(fixture.slug)}, 'fr', ${quote(JSON.stringify(content(fixture.slug)))}, 1, 'published', ${now}, ${now + 60 * 60 * 24 * 365}, ${now}, ${now});`,
      `insert into invitations (id, owner_id, theme_id, slug, locale, content, content_version, status, created_at, updated_at)`,
      `values (${quote(fixture.draftId)}, ${quote(fixture.userId)}, ${quote(fixture.themeId)}, null, 'fr', ${quote(JSON.stringify(content(fixture.draftSlug)))}, 1, 'draft', ${now}, ${now});`,
    ].join(' '),
  );
}

function cleanup(fixture: Fixture): void {
  try {
    sql(
      [
        `delete from rsvps where invitation_id = ${quote(fixture.invitationId)};`,
        `delete from invitations where id in (${quote(fixture.invitationId)}, ${quote(fixture.draftId)});`,
        ...(fixture.ownsTheme ? [`delete from themes where id = ${quote(fixture.themeId)};`] : []),
        `delete from session where user_id = ${quote(fixture.userId)};`,
        `delete from user where id = ${quote(fixture.userId)};`,
      ].join(' '),
    );
  } catch {
    // Best effort: a failed cleanup must not turn a passing run red.
  }
}

async function signIn(context: BrowserContext, fixture: Fixture, baseURL: string): Promise<void> {
  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: signedSessionCookie(fixture.sessionToken),
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

async function reply(request: APIRequestContext, body: Record<string, unknown>) {
  return request.post('/api/rsvp', {
    data: body,
    headers: { 'content-type': 'application/json' },
    failOnStatusCode: false,
  });
}

test.describe('RSVP journey', () => {
  let fixture: Fixture;

  test.beforeAll(async ({}, testInfo) => {
    // One fixture per worker, so a run split over several of them (or several
    // viewports) never reuses the same rows.
    fixture = makeFixture(`${testInfo.project.name}-w${testInfo.workerIndex}`);
    seed(fixture);
  });

  test.afterAll(() => cleanup(fixture));

  test.beforeEach(async ({ page }) => {
    const response = await page.goto(`/${fixture.slug}`);
    expect(
      response?.status(),
      'the published fixture was not served — is the server `next dev`, with the D1 binding?',
    ).toBe(200);
  });

  test('a guest opens the invitation, replies, and the couple sees the reply', async ({
    page,
    request,
    context,
    baseURL,
  }) => {
    // 1. The published invitation is served, in the couple's language.
    await expect(page.locator('.invitation')).toBeVisible();
    await expect(page.locator('.invitation')).toHaveAttribute('lang', 'fr');
    await expect(page.getByText('Zoé & Dylan').first()).toBeVisible();

    // 2. A bot fills the honeypot: answered like a success, stored nowhere.
    const trapped = await reply(request, {
      slug: fixture.slug,
      name: 'Spam Bot',
      attending: true,
      guests: 1,
      website: 'https://spam.example',
    });
    expect(trapped.status()).toBe(200);

    // 3. A real guest replies.
    const accepted = await reply(request, {
      slug: fixture.slug,
      name: 'Camille Durand',
      email: 'camille@example.test',
      attending: true,
      guests: 2,
      diet: 'végétarien',
      message: 'On a hâte !',
    });
    expect(accepted.status()).toBe(201);
    expect(await accepted.json()).toEqual({ ok: true });

    // 4. An unknown slug is refused.
    const unknown = await reply(request, {
      slug: 'does-not-exist-at-all',
      name: 'Nobody',
      attending: false,
      guests: 1,
    });
    expect(unknown.status()).toBe(404);

    // 5. The couple signs in and finds the reply on their dashboard.
    await signIn(context, fixture, baseURL ?? 'http://127.0.0.1:3100');
    await page.goto(`/app/${fixture.invitationId}/responses`);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Camille Durand')).toBeVisible();
    await expect(page.getByText('camille@example.test')).toBeVisible();
    await expect(page.getByText('végétarien')).toBeVisible();
    // The bot never made it into the table.
    await expect(page.getByText('Spam Bot')).toHaveCount(0);

    // 6. Counters: one reply, two heads.
    const counters = page.locator('dl dd');
    await expect(counters.nth(0)).toHaveText('1');
    await expect(counters.nth(2)).toHaveText('2');
    await expect(counters.nth(3)).toHaveText('1');
  });

  test('the calendar file and the QR code are served for a published invitation', async ({
    request,
  }) => {
    const ics = await request.get(`/api/ics/${fixture.slug}`);
    expect(ics.status()).toBe(200);
    expect(ics.headers()['content-type']).toContain('text/calendar');

    const body = await ics.text();
    expect(body).toContain('BEGIN:VCALENDAR');
    // 14:30 in Paris in June is 12:30 UTC.
    expect(body).toContain('DTSTART:20270612T123000Z');
    expect(body).toContain(`UID:invitation-${fixture.slug}@`);

    const qr = await request.get(`/api/qr/${fixture.slug}?size=256`);
    expect(qr.status()).toBe(200);
    expect(qr.headers()['content-type']).toContain('image/svg+xml');
    expect(await qr.text()).toContain('<svg');
  });

  test('the share page is owner-only', async ({ page, context, baseURL }) => {
    // Signed out: pushed to the sign-in page.
    await page.goto(`/app/${fixture.invitationId}/share`);
    await expect(page).toHaveURL(/\/login/);

    await signIn(context, fixture, baseURL ?? 'http://127.0.0.1:3100');
    await page.goto(`/app/${fixture.invitationId}/share`);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(fixture.slug, { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: /QR/i })).toBeVisible();
  });

  test('the couple picks a link, publishes, then takes the invitation offline', async ({
    page,
    context,
    baseURL,
  }) => {
    // Three server actions in a row, against a dev server shared with the two
    // other viewports: this one needs room to breathe.
    test.slow();
    await signIn(context, fixture, baseURL ?? 'http://127.0.0.1:3100');

    // The chosen link is free until it is published.
    expect((await page.request.get(`/${fixture.draftSlug}`)).status()).toBe(404);

    await page.goto(`/app/${fixture.draftId}/share`);

    // The link is saved first: publishing is deliberately a separate, explicit
    // step, so nothing goes online by a stray keystroke.
    await page
      .getByLabel(/Adresse de l'invitation|Address of the invitation/)
      .fill(fixture.draftSlug);
    await page.getByRole('button', { name: /Enregistrer le lien|Save the link/ }).click();
    await expect(page.getByText(/Lien enregistré|Link saved/)).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: /^(Publier|Publish)$/ }).click();
    await expect(
      page.getByText(/^(Cette invitation est en ligne\.|This invitation is online\.)$/),
    ).toBeVisible({ timeout: 20_000 });

    // The invitation is now served on that link, and so are its extras.
    const live = await page.request.get(`/${fixture.draftSlug}`);
    expect(live.status()).toBe(200);
    expect(await live.text()).toContain('Zoé');
    expect((await page.request.get(`/api/ics/${fixture.draftSlug}`)).status()).toBe(200);

    // Taking it offline leaves a sober page in the invitation's own language.
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /hors ligne|Take offline/ }).click();
    await expect(
      page.getByText(
        /^(Cette invitation n'est pas encore publiée\.|This invitation is not published yet\.)$/,
      ),
    ).toBeVisible({ timeout: 20_000 });

    const offline = await page.request.get(`/${fixture.draftSlug}`);
    expect(offline.status()).toBe(200);
    expect(await offline.text()).toContain("Cette invitation n'est plus disponible");
    expect((await page.request.get(`/api/ics/${fixture.draftSlug}`)).status()).toBe(404);
  });
});
