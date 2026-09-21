import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Database } from '@/db';
import { invitations, themes, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  createInvitation,
  getInvitationForOwner,
  getPublishedInvitationBySlug,
  getPublishedInvitationWithTheme,
  insertRsvp,
  listInvitationsByOwner,
  listRsvpsForOwner,
  updateInvitationContentForOwner,
} from '@/db/queries';
import { defaultContent } from '@/content/defaults';
import { CONTENT_VERSION } from '@/content/schema';
import { createTestD1, type TestD1 } from './helpers/d1';

/**
 * These run the real Drizzle D1 driver against an in-memory SQLite database
 * seeded with the very migrations `wrangler d1 migrations apply` executes.
 */

let d1: TestD1;
let db: Database;

const THEME_ID = 'theme-1';
const ALICE = 'user-alice';
const BOB = 'user-bob';

beforeEach(async () => {
  d1 = createTestD1();
  db = createDb(d1.binding);

  await db.insert(user).values([
    { id: ALICE, name: 'Alice', email: 'alice@example.com' },
    { id: BOB, name: 'Bob', email: 'bob@example.com' },
  ]);
  await db.insert(themes).values({
    id: THEME_ID,
    slug: 'mariage-noir-ivoire',
    name: 'Noir & ivoire',
    version: 1,
    status: 'active',
  });
});

afterEach(() => d1.close());

async function seedInvitation(ownerId: string, overrides: { slug?: string | null } = {}) {
  return createInvitation(db, {
    ownerId,
    themeId: THEME_ID,
    locale: 'fr',
    content: JSON.stringify(defaultContent('fr')),
    contentVersion: CONTENT_VERSION,
    slug: overrides.slug ?? null,
  });
}

describe('invitation queries', () => {
  it('stores and reads a draft back', async () => {
    const created = await seedInvitation(ALICE);
    expect(created.status).toBe('draft');
    expect(created.ownerId).toBe(ALICE);

    const found = await getInvitationForOwner(db, created.id, ALICE);
    expect(found?.id).toBe(created.id);
    expect(JSON.parse(found!.content).locale).toBe('fr');
  });

  it('lists only the invitations of their owner', async () => {
    await seedInvitation(ALICE);
    await seedInvitation(ALICE);
    await seedInvitation(BOB);

    expect(await listInvitationsByOwner(db, ALICE)).toHaveLength(2);
    expect(await listInvitationsByOwner(db, BOB)).toHaveLength(1);
    expect(await listInvitationsByOwner(db, 'nobody')).toHaveLength(0);
  });

  it('never returns another owner’s invitation', async () => {
    const alice = await seedInvitation(ALICE);
    expect(await getInvitationForOwner(db, alice.id, BOB)).toBeNull();
  });

  it('refuses to update another owner’s invitation', async () => {
    const alice = await seedInvitation(ALICE);

    const hijacked = await updateInvitationContentForOwner(
      db,
      alice.id,
      BOB,
      JSON.stringify(defaultContent('en')),
      CONTENT_VERSION,
    );
    expect(hijacked).toBeNull();

    const untouched = await getInvitationForOwner(db, alice.id, ALICE);
    expect(JSON.parse(untouched!.content).locale).toBe('fr');

    const updated = await updateInvitationContentForOwner(
      db,
      alice.id,
      ALICE,
      JSON.stringify(defaultContent('en')),
      CONTENT_VERSION,
    );
    expect(JSON.parse(updated!.content).locale).toBe('en');
  });

  it('serves a published invitation by slug, but not a draft', async () => {
    const invitation = await seedInvitation(ALICE, { slug: 'zoe-et-dylan' });
    expect(await getPublishedInvitationBySlug(db, 'zoe-et-dylan')).toBeNull();

    await db
      .update(invitations)
      .set({ status: 'published', publishedAt: new Date() })
      .where(eq(invitations.id, invitation.id));

    const published = await getPublishedInvitationBySlug(db, 'zoe-et-dylan');
    expect(published?.id).toBe(invitation.id);

    const withTheme = await getPublishedInvitationWithTheme(db, 'zoe-et-dylan');
    expect(withTheme?.themeSlug).toBe('mariage-noir-ivoire');
  });

  it('enforces slug uniqueness', async () => {
    await seedInvitation(ALICE, { slug: 'zoe-et-dylan' });
    await expect(seedInvitation(BOB, { slug: 'zoe-et-dylan' })).rejects.toThrow();
  });
});

describe('rsvp queries', () => {
  it('records a reply and reads it back for the owner only', async () => {
    const invitation = await seedInvitation(ALICE);

    const rsvp = await insertRsvp(db, {
      invitationId: invitation.id,
      name: 'Camille',
      email: 'camille@example.com',
      attending: true,
      guests: 2,
      diet: 'végétarien',
      message: 'On a hâte !',
      ipHash: 'abcdef',
    });

    expect(rsvp.attending).toBe(true);
    expect(rsvp.guests).toBe(2);

    const forOwner = await listRsvpsForOwner(db, invitation.id, ALICE);
    expect(forOwner).toHaveLength(1);
    expect(forOwner[0]?.name).toBe('Camille');

    expect(await listRsvpsForOwner(db, invitation.id, BOB)).toHaveLength(0);
  });

  it('refuses a reply attached to no invitation', async () => {
    await expect(
      insertRsvp(db, { invitationId: 'ghost', name: 'Nobody', attending: false }),
    ).rejects.toThrow();
  });
});
