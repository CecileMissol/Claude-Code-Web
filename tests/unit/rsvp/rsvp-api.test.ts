import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDb, type Database } from '@/db';
import { themes, user } from '@/db/schema';
import { createInvitation, listRsvpsForOwner, publishInvitationForOwner } from '@/db/queries';
import { defaultContent } from '@/content/defaults';
import { CONTENT_VERSION, type InvitationContent } from '@/content/schema';
import { hostingExpiry } from '@/lib/publish';
import { resetMemoryRateLimit } from '@/lib/rate-limit';
import { createTestD1, type TestD1 } from '../helpers/d1';
import type * as DbModule from '@/db';

/**
 * End-to-end test of the RSVP route handler, against a real SQLite database
 * behind the real Drizzle D1 driver. Only the two things a unit test cannot
 * have are faked: the Cloudflare context (no bindings, so the rate limiter
 * falls back to its in-memory window) and the mailer.
 */

let db: Database;
const sent: { to: string; subject: string }[] = [];
/** Whatever the handler handed to `waitUntil`, so the test can wait for it. */
const background: Promise<unknown>[] = [];

/** Settles the fire-and-forget work the handler scheduled after the response. */
async function flush(): Promise<void> {
  await Promise.all(background.splice(0));
}

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(async () => ({
    env: {},
    ctx: {
      waitUntil: (promise: Promise<unknown>) => {
        background.push(promise);
      },
    },
    cf: undefined,
  })),
}));

vi.mock('@/db', async (importOriginal) => {
  const actual = await importOriginal<typeof DbModule>();
  return {
    ...actual,
    getDb: () => db,
    getDbAsync: async () => db,
  };
});

vi.mock('@/lib/mail', () => ({
  sendMail: vi.fn(async (message: { to: string; subject: string }) => {
    sent.push({ to: message.to, subject: message.subject });
    return { id: 'test', driver: 'console' as const };
  }),
}));

const { POST } = await import('@/app/api/rsvp/route');

const THEME_ID = 'theme-1';
const ALICE = 'user-alice';

let d1: TestD1;
let invitationId: string;

function post(body: unknown, ip = '203.0.113.7'): Promise<Response> {
  return POST(
    new Request('https://example.test/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
}

async function seedPublished(overrides: Partial<InvitationContent['rsvp']> = {}) {
  const content = defaultContent('fr');
  const stored: InvitationContent = {
    ...content,
    couple: { partner1: { firstName: 'Zoé' }, partner2: { firstName: 'Dylan' } },
    rsvp: { ...content.rsvp, ...overrides },
  };

  const invitation = await createInvitation(db, {
    ownerId: ALICE,
    themeId: THEME_ID,
    locale: 'fr',
    content: JSON.stringify(stored),
    contentVersion: CONTENT_VERSION,
    slug: 'zoe-et-dylan',
  });

  const now = new Date();
  await publishInvitationForOwner(db, invitation.id, ALICE, {
    publishedAt: now,
    expiresAt: hostingExpiry(now),
  });

  invitationId = invitation.id;
  return invitation;
}

const VALID = {
  slug: 'zoe-et-dylan',
  name: 'Camille',
  email: 'camille@example.com',
  attending: true,
  guests: 2,
  diet: 'végétarien',
  message: 'On a hâte !',
};

beforeEach(async () => {
  d1 = createTestD1();
  db = createDb(d1.binding);
  sent.length = 0;
  background.length = 0;
  resetMemoryRateLimit();

  await db.insert(user).values({ id: ALICE, name: 'Alice', email: 'alice@example.com' });
  await db.insert(themes).values({
    id: THEME_ID,
    slug: 'mariage-noir-ivoire',
    name: 'Noir & ivoire',
    version: 1,
    status: 'active',
  });
});

afterEach(() => d1.close());

describe('POST /api/rsvp', () => {
  it('records a valid reply', async () => {
    await seedPublished();

    const response = await post(VALID);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const replies = await listRsvpsForOwner(db, invitationId, ALICE);
    expect(replies).toHaveLength(1);
    expect(replies[0]).toMatchObject({
      name: 'Camille',
      email: 'camille@example.com',
      attending: true,
      guests: 2,
      diet: 'végétarien',
    });
    // The raw address is never stored, only a hash of it.
    expect(replies[0]?.ipHash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('answers a filled honeypot with a silent success and stores nothing', async () => {
    await seedPublished();

    const response = await post({ ...VALID, website: 'https://spam.example' });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(await listRsvpsForOwner(db, invitationId, ALICE)).toHaveLength(0);
  });

  it('rejects a payload that does not fit the schema', async () => {
    await seedPublished();

    for (const body of [
      'not json',
      { ...VALID, name: '' },
      { ...VALID, attending: 'yes' },
      { ...VALID, guests: 99 },
      { ...VALID, email: 'not-an-email' },
      { ...VALID, slug: undefined },
    ]) {
      const response = await post(body);
      expect(response.status, JSON.stringify(body)).toBe(400);
      await expect(response.json()).resolves.toEqual({ ok: false, error: 'invalid' });
    }
  });

  it('refuses a slug that is not a published invitation', async () => {
    const response = await post(VALID);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'not_found' });
  });

  it('refuses a reply when the form is switched off', async () => {
    await seedPublished({ enabled: false });

    const response = await post(VALID);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'closed' });
  });

  it('refuses a reply after the deadline, and accepts one before it', async () => {
    await seedPublished({ deadline: '2020-01-01' });
    expect((await post(VALID)).status).toBe(403);

    d1.close();
    d1 = createTestD1();
    db = createDb(d1.binding);
    resetMemoryRateLimit();
    await db.insert(user).values({ id: ALICE, name: 'Alice', email: 'alice@example.com' });
    await db.insert(themes).values({
      id: THEME_ID,
      slug: 'mariage-noir-ivoire',
      name: 'Noir & ivoire',
      version: 1,
      status: 'active',
    });

    await seedPublished({ deadline: '2099-01-01' });
    expect((await post(VALID)).status).toBe(201);
  });

  it('stops the sixth reply from the same address within ten minutes', async () => {
    await seedPublished();

    for (let index = 0; index < 5; index += 1) {
      const response = await post({ ...VALID, name: `Guest ${index}` });
      expect(response.status, `reply ${index}`).toBe(201);
    }

    const blocked = await post({ ...VALID, name: 'Guest 6' });
    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toEqual({ ok: false, error: 'rate_limited' });

    // Another address is unaffected.
    expect((await post({ ...VALID, name: 'Elsewhere' }, '198.51.100.4')).status).toBe(201);

    expect(await listRsvpsForOwner(db, invitationId, ALICE)).toHaveLength(6);
  });

  it('drops the fields the couple did not ask for', async () => {
    await seedPublished({ askEmail: false, askDiet: false, askMessage: false });

    expect((await post(VALID)).status).toBe(201);

    const [reply] = await listRsvpsForOwner(db, invitationId, ALICE);
    expect(reply?.email).toBeNull();
    expect(reply?.diet).toBeNull();
    expect(reply?.message).toBeNull();
    expect(reply?.name).toBe('Camille');
  });

  it('clamps the party size to the maximum the couple set', async () => {
    await seedPublished({ maxGuestsPerReply: 2 });

    expect((await post({ ...VALID, guests: 5 })).status).toBe(201);

    const [reply] = await listRsvpsForOwner(db, invitationId, ALICE);
    expect(reply?.guests).toBe(2);
  });

  it('counts a decline as one person, whatever was submitted', async () => {
    await seedPublished();

    expect((await post({ ...VALID, attending: false, guests: 4 })).status).toBe(201);

    const [reply] = await listRsvpsForOwner(db, invitationId, ALICE);
    expect(reply?.attending).toBe(false);
    expect(reply?.guests).toBe(1);
  });

  it('mails the couple when the notification is on, and stays quiet when it is off', async () => {
    await seedPublished({ notifyByEmail: true });
    await post(VALID);
    await flush();
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe('alice@example.com');
    expect(sent[0]?.subject).toContain('Camille');

    sent.length = 0;

    d1.close();
    d1 = createTestD1();
    db = createDb(d1.binding);
    resetMemoryRateLimit();
    await db.insert(user).values({ id: ALICE, name: 'Alice', email: 'alice@example.com' });
    await db.insert(themes).values({
      id: THEME_ID,
      slug: 'mariage-noir-ivoire',
      name: 'Noir & ivoire',
      version: 1,
      status: 'active',
    });

    await seedPublished({ notifyByEmail: false });
    await post(VALID);
    await flush();
    expect(sent).toHaveLength(0);
  });
});
