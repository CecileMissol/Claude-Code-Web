import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end run of the editor: magic-link sign-in, draft creation, an edit,
 * the automatic save, and the live preview showing the result. It also checks
 * that a second couple cannot open the first one's invitation.
 *
 * It needs the Cloudflare bindings (D1 for the invitations, R2 for the photos),
 * which only `next dev` provides — `next start` runs without them. So this file
 * is run against a development server:
 *
 *   pnpm db:migrate:local && pnpm db:seed:local
 *   PORT=3102 pnpm dev &
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3102 pnpm exec playwright test tests/e2e/editor.spec.ts
 *
 * The magic link is not read from an inbox: in development the mailer only
 * prints it, so the token is read straight from the local D1 database, exactly
 * where Better Auth stored it.
 */

const PROJECT_DIR = process.env.E2E_PROJECT_DIR ?? process.cwd();

/** Runs a read-only query against the local D1 database. */
function queryLocalD1(sql: string): Record<string, unknown>[] {
  const output = execFileSync(
    'pnpm',
    ['exec', 'wrangler', 'd1', 'execute', 'invitations-db', '--local', '--json', '--command', sql],
    { encoding: 'utf8', cwd: PROJECT_DIR, stdio: ['ignore', 'pipe', 'ignore'] },
  );

  const parsed = JSON.parse(output) as { results?: Record<string, unknown>[] }[];
  return parsed[0]?.results ?? [];
}

/** The magic-link token Better Auth stored for this address. */
function magicLinkToken(email: string): string {
  const rows = queryLocalD1(
    `select identifier, value from verification where value like '%${email}%' order by rowid desc limit 1`,
  );
  const token = rows[0]?.identifier;
  expect(typeof token, `no magic link stored for ${email}`).toBe('string');
  return token as string;
}

/** Signs in through the real magic-link flow and lands on the dashboard. */
async function signIn(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Send me a link' }).click();
  await expect(page.getByText('Check your inbox')).toBeVisible();

  await page.goto(
    `/api/auth/magic-link/verify?token=${encodeURIComponent(magicLinkToken(email))}&callbackURL=/app`,
  );
  await expect(page.getByRole('heading', { name: 'My invitations' })).toBeVisible();
}

test.beforeEach(async ({ context, baseURL }) => {
  // The interface locale comes from a cookie; pin it so the labels are stable.
  await context.addCookies([{ name: 'locale', value: 'en', url: baseURL ?? 'http://127.0.0.1:3102' }]);
});

test('a couple signs in, creates a draft, edits it and sees the preview', async ({
  page,
}, testInfo) => {
  const email = `editor-${testInfo.project.name}@example.test`;
  const firstName = `Zoé${testInfo.project.name.replace(/[^a-z]/gi, '')}`;

  await signIn(page, email);

  await page.getByRole('button', { name: 'Create an invitation' }).click();
  await page.waitForURL(/\/app\/[^/]+\/edit$/);
  await expect(page.getByRole('heading', { name: 'Edit your invitation' })).toBeVisible();

  // The steps are generated from the theme manifest.
  await expect(page.getByRole('button', { name: /The two of you/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Photos/ })).toBeVisible();

  const nameField = page.getByLabel('First name', { exact: true });
  await nameField.fill(firstName);

  // Debounced automatic save: 800 ms after the last keystroke.
  await expect(page.getByLabel('Saving status')).toHaveText('Saved', { timeout: 15_000 });

  // The preview is the theme itself, rendered by /app/[id]/preview in an iframe.
  const preview = page.frameLocator('iframe[title="Invitation preview"]');
  await expect(preview.getByText(firstName).first()).toBeVisible({ timeout: 15_000 });

  // Nothing is kept in the browser: the value comes back from the database.
  const url = page.url();
  await page.reload();
  await expect(page.getByLabel('First name', { exact: true })).toHaveValue(firstName);

  // A second couple cannot read that invitation.
  const otherEmail = `intruder-${testInfo.project.name}@example.test`;
  const otherContext = await page.context().browser()!.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: page.viewportSize() ?? undefined,
  });
  await otherContext.addCookies([
    { name: 'locale', value: 'en', url: testInfo.project.use.baseURL ?? 'http://127.0.0.1:3102' },
  ]);

  const otherPage = await otherContext.newPage();
  await signIn(otherPage, otherEmail);
  await otherPage.goto(new URL(url).pathname);
  await expect(otherPage.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await otherPage.goto(`${new URL(url).pathname.replace(/\/edit$/, '')}/preview`);
  await expect(otherPage.getByRole('heading', { name: 'Page not found' })).toBeVisible();

  await otherContext.close();
});
