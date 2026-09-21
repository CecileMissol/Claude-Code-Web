import { desc, eq, sql } from 'drizzle-orm';
import type { Database } from '../index';
import {
  auditLog,
  invitations,
  themes,
  user,
  type Invitation,
  type InvitationStatus,
  type User,
} from '../schema';

export type AuditLogRow = typeof auditLog.$inferSelect;

/**
 * Back-office queries: user provisioning at activation time, the cross-owner
 * invitations list, and the audit log. Unlike `src/db/queries/invitations.ts`
 * these are deliberately NOT owner-scoped — every caller here is expected to
 * have already passed `requireAdmin()`.
 */

/**
 * Finds a user by email (case-insensitive), or creates one.
 *
 * Used when an admin approves an Etsy activation: the buyer gets an account
 * without going through Better Auth's own sign-up endpoint, by inserting
 * directly into the `user` table it reads — the same table, same shape, same
 * unique index on `email`. `emailVerified` is set to `true`: the admin has
 * just matched the address to a real Etsy order.
 */
export async function getOrCreateUserByEmail(db: Database, email: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const existing = await db
    .select()
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1);
  if (existing[0]) return existing[0];

  const now = new Date();
  const inserted = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      name: '',
      email: normalized,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const created = inserted[0];
  if (!created) throw new Error('User insert returned no row.');
  return created;
}

export interface AdminInvitationRow {
  invitation: Invitation;
  ownerEmail: string;
  themeSlug: string;
}

/** Every invitation, most recently updated first — for the admin back office. */
export async function listInvitationsForAdmin(db: Database, limit = 200): Promise<AdminInvitationRow[]> {
  return db
    .select({ invitation: invitations, ownerEmail: user.email, themeSlug: themes.slug })
    .from(invitations)
    .innerJoin(user, eq(user.id, invitations.ownerId))
    .innerJoin(themes, eq(themes.id, invitations.themeId))
    .orderBy(desc(invitations.updatedAt))
    .limit(limit);
}

/**
 * Extends `expiresAt` by `months` (default 12), counted from `now` or from the
 * current expiry, whichever is later — so extending twice never loses time.
 */
export async function extendInvitationExpiry(
  db: Database,
  id: string,
  months = 12,
): Promise<Invitation | null> {
  const rows = await db.select().from(invitations).where(eq(invitations.id, id)).limit(1);
  const current = rows[0];
  if (!current) return null;

  const now = Date.now();
  const base = current.expiresAt && current.expiresAt.getTime() > now ? current.expiresAt : new Date(now);
  const next = new Date(base);
  next.setUTCMonth(next.getUTCMonth() + months);

  const updated = await db
    .update(invitations)
    .set({ expiresAt: next, updatedAt: new Date() })
    .where(eq(invitations.id, id))
    .returning();
  return updated[0] ?? null;
}

/**
 * Disables an invitation, or reactivates one: reactivating restores
 * `published` when the invitation already has a publish date, `draft`
 * otherwise (a draft never had a public status to go back to).
 */
export async function setInvitationEnabled(
  db: Database,
  id: string,
  enabled: boolean,
): Promise<Invitation | null> {
  const rows = await db.select().from(invitations).where(eq(invitations.id, id)).limit(1);
  const current = rows[0];
  if (!current) return null;

  const status: InvitationStatus = enabled ? (current.publishedAt ? 'published' : 'draft') : 'disabled';
  const updated = await db
    .update(invitations)
    .set({ status, updatedAt: new Date() })
    .where(eq(invitations.id, id))
    .returning();
  return updated[0] ?? null;
}

export interface InsertAuditLogInput {
  id?: string;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  /** Serialised to JSON; pass any plain object. */
  meta?: unknown;
}

export async function insertAuditLog(db: Database, input: InsertAuditLogInput): Promise<void> {
  await db.insert(auditLog).values({
    id: input.id ?? crypto.randomUUID(),
    actorEmail: input.actorEmail ?? null,
    action: input.action,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    meta: input.meta !== undefined ? JSON.stringify(input.meta) : null,
    createdAt: new Date(),
  });
}

/** The most recent audit entries, newest first. */
export async function listAuditLog(db: Database, limit = 100): Promise<AuditLogRow[]> {
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}
