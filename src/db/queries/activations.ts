import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '../index';
import { activations, themes, type Activation } from '../schema';

/**
 * Activation queries (Etsy order activation, V0 manual review).
 *
 * The unique index `activations_order_theme_unique` on
 * (`etsy_order_id`, `theme_id`) means there is at most one row per pair,
 * whatever its status — see `reopenActivation` for what that implies for a
 * buyer who resubmits after a refusal.
 */

export interface CreateActivationInput {
  id?: string;
  etsyOrderId: string;
  email: string;
  themeId: string;
}

/** The one activation row for a given (order, theme) pair, whatever its status. */
export async function findActivationByOrderAndTheme(
  db: Database,
  etsyOrderId: string,
  themeId: string,
): Promise<Activation | null> {
  const rows = await db
    .select()
    .from(activations)
    .where(and(eq(activations.etsyOrderId, etsyOrderId), eq(activations.themeId, themeId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Inserts a brand-new pending activation request. Emails are the caller's job. */
export async function createActivation(db: Database, input: CreateActivationInput): Promise<Activation> {
  const row = {
    id: input.id ?? crypto.randomUUID(),
    etsyOrderId: input.etsyOrderId,
    email: input.email.trim().toLowerCase(),
    themeId: input.themeId,
    status: 'pending' as const,
    userId: null,
    reviewedAt: null,
    createdAt: new Date(),
  };

  const inserted = await db.insert(activations).values(row).returning();
  const created = inserted[0];
  if (!created) throw new Error('Activation insert returned no row.');
  return created;
}

/**
 * Re-opens a previously `rejected` request for another try: updates the same
 * row back to `pending` instead of inserting a second one, which the unique
 * index would refuse anyway.
 */
export async function reopenActivation(db: Database, id: string, email: string): Promise<Activation | null> {
  const updated = await db
    .update(activations)
    .set({ status: 'pending', email: email.trim().toLowerCase(), userId: null, reviewedAt: null })
    .where(eq(activations.id, id))
    .returning();
  return updated[0] ?? null;
}

export interface PendingActivationRow {
  activation: Activation;
  themeSlug: string;
  themeName: string;
}

/** Every pending activation, oldest first (first come, first served), with its theme. */
export async function listPendingActivations(db: Database): Promise<PendingActivationRow[]> {
  return db
    .select({ activation: activations, themeSlug: themes.slug, themeName: themes.name })
    .from(activations)
    .innerJoin(themes, eq(themes.id, activations.themeId))
    .where(eq(activations.status, 'pending'))
    .orderBy(activations.createdAt);
}

export async function getActivationById(db: Database, id: string): Promise<Activation | null> {
  const rows = await db.select().from(activations).where(eq(activations.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Marks a request approved and links it to the account it created or matched. */
export async function markActivationApproved(
  db: Database,
  id: string,
  userId: string,
): Promise<Activation | null> {
  const updated = await db
    .update(activations)
    .set({ status: 'approved', userId, reviewedAt: new Date() })
    .where(eq(activations.id, id))
    .returning();
  return updated[0] ?? null;
}

export async function markActivationRejected(db: Database, id: string): Promise<Activation | null> {
  const updated = await db
    .update(activations)
    .set({ status: 'rejected', reviewedAt: new Date() })
    .where(eq(activations.id, id))
    .returning();
  return updated[0] ?? null;
}

/**
 * Used by the sign-in gate (`src/lib/auth.ts`): does this email have an
 * approved purchase? Comparison is case-insensitive because the buyer may not
 * type their email the same way twice.
 */
export async function getApprovedActivationByEmail(db: Database, email: string): Promise<Activation | null> {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select()
    .from(activations)
    .where(and(eq(activations.status, 'approved'), sql`lower(${activations.email}) = ${normalized}`))
    .limit(1);
  return rows[0] ?? null;
}
