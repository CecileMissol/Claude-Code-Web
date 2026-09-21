import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../index';
import { invitations, themes, type Invitation, type InvitationStatus } from '../schema';

/**
 * Invitation queries.
 *
 * There is no row-level security on D1, so ownership is enforced here: every
 * owner-scoped helper takes an `ownerId` and puts it in the WHERE clause.
 */

/** Every invitation belonging to a user, most recently updated first. */
export async function listInvitationsByOwner(db: Database, ownerId: string): Promise<Invitation[]> {
  return db
    .select()
    .from(invitations)
    .where(eq(invitations.ownerId, ownerId))
    .orderBy(desc(invitations.updatedAt));
}

/** One invitation, but only if the user owns it. Returns `null` otherwise. */
export async function getInvitationForOwner(
  db: Database,
  id: string,
  ownerId: string,
): Promise<Invitation | null> {
  const rows = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, id), eq(invitations.ownerId, ownerId)))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * The published invitation behind a public `/[slug]` URL.
 * Drafts, expired and disabled invitations are deliberately invisible.
 */
export async function getPublishedInvitationBySlug(
  db: Database,
  slug: string,
): Promise<Invitation | null> {
  const rows = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.slug, slug), eq(invitations.status, 'published')))
    .limit(1);

  return rows[0] ?? null;
}

export interface CreateInvitationInput {
  id?: string;
  ownerId: string;
  themeId: string;
  locale: string;
  content: string;
  contentVersion: number;
  slug?: string | null;
  status?: InvitationStatus;
}

/** Inserts a draft invitation and returns the stored row. */
export async function createInvitation(
  db: Database,
  input: CreateInvitationInput,
): Promise<Invitation> {
  const now = new Date();
  const row = {
    id: input.id ?? crypto.randomUUID(),
    ownerId: input.ownerId,
    themeId: input.themeId,
    slug: input.slug ?? null,
    locale: input.locale,
    content: input.content,
    contentVersion: input.contentVersion,
    status: input.status ?? ('draft' as const),
    createdAt: now,
    updatedAt: now,
  };

  const inserted = await db.insert(invitations).values(row).returning();
  const created = inserted[0];
  if (!created) throw new Error('Invitation insert returned no row.');
  return created;
}

/** Updates the JSON content of an invitation the user owns. */
export async function updateInvitationContentForOwner(
  db: Database,
  id: string,
  ownerId: string,
  content: string,
  contentVersion: number,
): Promise<Invitation | null> {
  const updated = await db
    .update(invitations)
    .set({ content, contentVersion, updatedAt: new Date() })
    .where(and(eq(invitations.id, id), eq(invitations.ownerId, ownerId)))
    .returning();

  return updated[0] ?? null;
}

export interface PublishedInvitation {
  invitation: Invitation;
  /** Folder name of the theme, as registered in `src/themes/registry.ts`. */
  themeSlug: string;
}

/**
 * Published invitation plus its theme slug, in a single round trip.
 * `invitations.themeId` is a database id, not a folder name, so the join is
 * what tells the renderer which theme module to load.
 */
export async function getPublishedInvitationWithTheme(
  db: Database,
  slug: string,
): Promise<PublishedInvitation | null> {
  const rows = await db
    .select({ invitation: invitations, themeSlug: themes.slug })
    .from(invitations)
    .innerJoin(themes, eq(themes.id, invitations.themeId))
    .where(and(eq(invitations.slug, slug), eq(invitations.status, 'published')))
    .limit(1);

  return rows[0] ?? null;
}
