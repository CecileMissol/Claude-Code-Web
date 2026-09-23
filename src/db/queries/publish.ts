import { and, eq, isNotNull, lte, ne, sql } from 'drizzle-orm';
import type { Database } from '../index';
import { invitations, themes, user, type Invitation } from '../schema';

/**
 * Publication queries (phase 5).
 *
 * Kept apart from `invitations.ts` so the existing read/write helpers stay
 * untouched. Like them, every owner-scoped helper puts `ownerId` in the WHERE
 * clause: there is no row-level security on D1.
 */

/** True when the slug already belongs to an invitation other than `exceptId`. */
export async function isSlugTaken(
  db: Database,
  slug: string,
  exceptId?: string | null,
): Promise<boolean> {
  const where = exceptId
    ? and(eq(invitations.slug, slug), ne(invitations.id, exceptId))
    : eq(invitations.slug, slug);

  const rows = await db.select({ id: invitations.id }).from(invitations).where(where).limit(1);
  return rows.length > 0;
}

/**
 * Stores the chosen slug on a draft or published invitation the user owns.
 * The caller has already validated the slug's shape and its availability; the
 * unique index is the last line of defence and will throw on a race.
 */
export async function setInvitationSlugForOwner(
  db: Database,
  id: string,
  ownerId: string,
  slug: string,
): Promise<Invitation | null> {
  const updated = await db
    .update(invitations)
    .set({ slug, updatedAt: new Date() })
    .where(and(eq(invitations.id, id), eq(invitations.ownerId, ownerId)))
    .returning();

  return updated[0] ?? null;
}

export interface PublishOptions {
  /** Defaults to now. */
  publishedAt?: Date;
  /** Defaults to `publishedAt` + `HOSTING_MONTHS`. */
  expiresAt: Date;
  /** Set when the invitation is getting its slug at publish time. */
  slug?: string;
}

/**
 * Flips an invitation to `published`.
 *
 * `publishedAt` is only written the first time: re-publishing an invitation
 * that was disabled keeps the original publication date, so the hosting window
 * cannot be restarted by toggling the button.
 */
export async function publishInvitationForOwner(
  db: Database,
  id: string,
  ownerId: string,
  options: PublishOptions,
): Promise<Invitation | null> {
  const now = options.publishedAt ?? new Date();

  const updated = await db
    .update(invitations)
    .set({
      status: 'published',
      ...(options.slug ? { slug: options.slug } : {}),
      publishedAt: sql`coalesce(${invitations.publishedAt}, ${Math.floor(now.getTime() / 1000)})`,
      expiresAt: options.expiresAt,
      updatedAt: now,
    })
    .where(and(eq(invitations.id, id), eq(invitations.ownerId, ownerId)))
    .returning();

  return updated[0] ?? null;
}

/**
 * Takes a published invitation offline. The slug is kept, so the couple can put
 * it back online on the same link.
 */
export async function unpublishInvitationForOwner(
  db: Database,
  id: string,
  ownerId: string,
): Promise<Invitation | null> {
  const updated = await db
    .update(invitations)
    .set({ status: 'disabled', updatedAt: new Date() })
    .where(and(eq(invitations.id, id), eq(invitations.ownerId, ownerId)))
    .returning();

  return updated[0] ?? null;
}

export interface InvitationBySlug {
  invitation: Invitation;
  themeSlug: string;
}

/**
 * The invitation behind a slug, whatever its status.
 *
 * `/[slug]` needs this to tell "never existed" (404) from "expired or taken
 * offline", which deserves a sober page rather than a not-found.
 */
export async function getInvitationBySlugAnyStatus(
  db: Database,
  slug: string,
): Promise<InvitationBySlug | null> {
  const rows = await db
    .select({ invitation: invitations, themeSlug: themes.slug })
    .from(invitations)
    .innerJoin(themes, eq(themes.id, invitations.themeId))
    .where(eq(invitations.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Flips every published invitation whose hosting window has closed to
 * `expired`. Idempotent; run by the retention job.
 */
export async function expireDuePublications(db: Database, now: Date = new Date()): Promise<number> {
  const updated = await db
    .update(invitations)
    .set({ status: 'expired', updatedAt: now })
    .where(
      and(
        eq(invitations.status, 'published'),
        isNotNull(invitations.expiresAt),
        lte(invitations.expiresAt, now),
      ),
    )
    .returning({ id: invitations.id });

  return updated.length;
}

/** E-mail of the couple owning an invitation, for the RSVP notification. */
export async function getInvitationOwnerEmail(
  db: Database,
  invitationId: string,
): Promise<string | null> {
  const rows = await db
    .select({ email: user.email })
    .from(invitations)
    .innerJoin(user, eq(user.id, invitations.ownerId))
    .where(eq(invitations.id, invitationId))
    .limit(1);

  return rows[0]?.email ?? null;
}
