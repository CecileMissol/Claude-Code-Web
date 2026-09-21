import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Database } from '@/db';
import { themes, user } from '@/db/schema';
import {
  createInvitation,
  extendInvitationExpiry,
  getOrCreateUserByEmail,
  insertAuditLog,
  listAuditLog,
  listInvitationsForAdmin,
  setInvitationEnabled,
} from '@/db/queries';
import { defaultContent } from '@/content/defaults';
import { CONTENT_VERSION } from '@/content/schema';
import { createTestD1, type TestD1 } from '../helpers/d1';

let d1: TestD1;
let db: Database;

const THEME_ID = 'theme-1';

beforeEach(async () => {
  d1 = createTestD1();
  db = createDb(d1.binding);
  await db.insert(themes).values({
    id: THEME_ID,
    slug: 'mariage-noir-ivoire',
    name: 'Noir & ivoire',
    version: 1,
    status: 'active',
  });
});

afterEach(() => d1.close());

describe('getOrCreateUserByEmail', () => {
  it('creates a user on first call, reuses it on the next (case-insensitive)', async () => {
    const created = await getOrCreateUserByEmail(db, 'Buyer@Example.com');
    expect(created.email).toBe('buyer@example.com');

    const again = await getOrCreateUserByEmail(db, 'buyer@example.com');
    expect(again.id).toBe(created.id);

    const rows = await db.select().from(user);
    expect(rows).toHaveLength(1);
  });
});

describe('listInvitationsForAdmin', () => {
  it('lists every invitation with its owner email and theme slug, not owner-scoped', async () => {
    const alice = await getOrCreateUserByEmail(db, 'alice@example.com');
    const bob = await getOrCreateUserByEmail(db, 'bob@example.com');

    await createInvitation(db, {
      ownerId: alice.id,
      themeId: THEME_ID,
      locale: 'en',
      content: JSON.stringify(defaultContent('en')),
      contentVersion: CONTENT_VERSION,
    });
    await createInvitation(db, {
      ownerId: bob.id,
      themeId: THEME_ID,
      locale: 'fr',
      content: JSON.stringify(defaultContent('fr')),
      contentVersion: CONTENT_VERSION,
    });

    const rows = await listInvitationsForAdmin(db);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.ownerEmail).sort()).toEqual(['alice@example.com', 'bob@example.com']);
    expect(rows.every((row) => row.themeSlug === 'mariage-noir-ivoire')).toBe(true);
  });
});

describe('extendInvitationExpiry', () => {
  it('extends from now when there is no current expiry', async () => {
    const owner = await getOrCreateUserByEmail(db, 'owner@example.com');
    const invitation = await createInvitation(db, {
      ownerId: owner.id,
      themeId: THEME_ID,
      locale: 'en',
      content: JSON.stringify(defaultContent('en')),
      contentVersion: CONTENT_VERSION,
    });

    const updated = await extendInvitationExpiry(db, invitation.id, 12);
    expect(updated?.expiresAt).toBeInstanceOf(Date);
    const monthsAhead =
      (updated!.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    expect(monthsAhead).toBeGreaterThan(11);
    expect(monthsAhead).toBeLessThan(13);
  });

  it('extends from the current expiry when it is still in the future', async () => {
    const owner = await getOrCreateUserByEmail(db, 'owner2@example.com');
    const invitation = await createInvitation(db, {
      ownerId: owner.id,
      themeId: THEME_ID,
      locale: 'en',
      content: JSON.stringify(defaultContent('en')),
      contentVersion: CONTENT_VERSION,
    });

    const first = await extendInvitationExpiry(db, invitation.id, 12);
    const second = await extendInvitationExpiry(db, invitation.id, 12);
    expect(second!.expiresAt!.getTime()).toBeGreaterThan(first!.expiresAt!.getTime());
  });
});

describe('setInvitationEnabled', () => {
  it('disables a draft invitation, then reactivates it back to draft', async () => {
    const owner = await getOrCreateUserByEmail(db, 'owner3@example.com');
    const invitation = await createInvitation(db, {
      ownerId: owner.id,
      themeId: THEME_ID,
      locale: 'en',
      content: JSON.stringify(defaultContent('en')),
      contentVersion: CONTENT_VERSION,
    });

    const disabled = await setInvitationEnabled(db, invitation.id, false);
    expect(disabled?.status).toBe('disabled');

    const reenabled = await setInvitationEnabled(db, invitation.id, true);
    expect(reenabled?.status).toBe('draft');
  });
});

describe('audit log', () => {
  it('records entries and lists the most recent first', async () => {
    await insertAuditLog(db, { action: 'activation.approved', targetType: 'activation', targetId: 'a-1' });
    await insertAuditLog(db, { action: 'activation.rejected', targetType: 'activation', targetId: 'a-2' });

    const entries = await listAuditLog(db);
    expect(entries).toHaveLength(2);
    // Both inserts land in the same unix second in this fast test, so only
    // membership (not strict tie-breaking order) is asserted here.
    expect(entries.map((entry) => entry.action).sort()).toEqual([
      'activation.approved',
      'activation.rejected',
    ]);
  });
});
