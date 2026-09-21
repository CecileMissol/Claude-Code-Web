import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { createDb, type Database } from '@/db';
import { themes, user } from '@/db/schema';
import {
  createInvitation,
  getInvitationForOwner,
  getInvitationWithThemeForOwner,
  listInvitationsWithThemeByOwner,
  updateInvitationContentForOwner,
} from '@/db/queries';
import { ensureThemeSeeded, seedThemes, themeSeedId, themeSeedRow } from '@/db/seed';
import { defaultContent } from '@/content/defaults';
import { CONTENT_VERSION } from '@/content/schema';
import { manifest } from '@/themes/mariage-noir-ivoire/manifest';
import { createTestD1, type TestD1 } from '../helpers/d1';

/**
 * Access control of the editor queries, and the theme seed.
 *
 * D1 has no row-level security, so these run the real Drizzle driver against a
 * SQLite database built from the real migrations and check that Bob can neither
 * read nor write what belongs to Alice.
 */

let d1: TestD1;
let db: Database;

const ALICE = 'user-alice';
const BOB = 'user-bob';
const ROW = themeSeedRow(manifest);

beforeEach(async () => {
  d1 = createTestD1();
  db = createDb(d1.binding);

  await db.insert(user).values([
    { id: ALICE, name: 'Alice', email: 'alice@example.com' },
    { id: BOB, name: 'Bob', email: 'bob@example.com' },
  ]);
});

afterEach(() => d1.close());

async function seedInvitation(ownerId: string) {
  await seedThemes(db, [ROW]);
  return createInvitation(db, {
    ownerId,
    themeId: ROW.id,
    locale: 'fr',
    content: JSON.stringify(defaultContent('fr')),
    contentVersion: CONTENT_VERSION,
  });
}

describe('theme seed', () => {
  it('derives the row from the manifest', () => {
    expect(ROW).toEqual({
      id: themeSeedId(manifest.slug),
      slug: manifest.slug,
      name: manifest.name.en,
      version: manifest.version,
      status: 'active',
    });
  });

  it('is idempotent and keeps the same id', async () => {
    await seedThemes(db, [ROW]);
    await seedThemes(db, [{ ...ROW, name: 'Renamed', version: 2 }]);

    const rows = await db.select().from(themes).where(eq(themes.slug, manifest.slug));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: ROW.id, name: 'Renamed', version: 2, status: 'active' });
  });

  it('returns the existing row instead of inserting a second one', async () => {
    await seedThemes(db, [ROW]);
    await expect(ensureThemeSeeded(db, manifest.slug)).resolves.toEqual({
      id: ROW.id,
      slug: manifest.slug,
    });

    const rows = await db.select().from(themes);
    expect(rows).toHaveLength(1);
  });
});

describe('an invitation is only visible to its owner', () => {
  it('hides it from anybody else, including its theme', async () => {
    const invitation = await seedInvitation(ALICE);

    await expect(getInvitationForOwner(db, invitation.id, BOB)).resolves.toBeNull();
    await expect(getInvitationWithThemeForOwner(db, invitation.id, BOB)).resolves.toBeNull();
    await expect(listInvitationsWithThemeByOwner(db, BOB)).resolves.toEqual([]);

    const mine = await getInvitationWithThemeForOwner(db, invitation.id, ALICE);
    expect(mine?.themeSlug).toBe(manifest.slug);
    expect(mine?.invitation.id).toBe(invitation.id);
  });

  it('refuses a write from anybody else and leaves the content untouched', async () => {
    const invitation = await seedInvitation(ALICE);
    const tampered = JSON.stringify({ ...defaultContent('fr'), locale: 'en' });

    await expect(
      updateInvitationContentForOwner(db, invitation.id, BOB, tampered, CONTENT_VERSION),
    ).resolves.toBeNull();

    const after = await getInvitationForOwner(db, invitation.id, ALICE);
    expect(after?.content).toBe(invitation.content);

    const saved = await updateInvitationContentForOwner(
      db,
      invitation.id,
      ALICE,
      tampered,
      CONTENT_VERSION,
    );
    expect(saved?.content).toBe(tampered);
  });

  it('answers the same way for an unknown id as for someone else’s', async () => {
    await seedInvitation(ALICE);
    await expect(getInvitationWithThemeForOwner(db, 'does-not-exist', BOB)).resolves.toBeNull();
  });
});
