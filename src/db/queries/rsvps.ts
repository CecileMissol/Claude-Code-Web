import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../index';
import { invitations, rsvps, type NewRsvp, type Rsvp } from '../schema';

/** RSVP queries. Reads are owner-scoped; the insert is public but throttled. */

export interface InsertRsvpInput {
  id?: string;
  invitationId: string;
  name: string;
  email?: string | null;
  attending: boolean;
  guests?: number;
  diet?: string | null;
  message?: string | null;
  ipHash?: string | null;
}

/**
 * Records a guest reply. Callers must have checked the rate limit and the
 * honeypot field first, and must have resolved `invitationId` from a published
 * slug — never from user input.
 */
export async function insertRsvp(db: Database, input: InsertRsvpInput): Promise<Rsvp> {
  const row: NewRsvp = {
    id: input.id ?? crypto.randomUUID(),
    invitationId: input.invitationId,
    name: input.name,
    email: input.email ?? null,
    attending: input.attending,
    guests: input.guests ?? 1,
    diet: input.diet ?? null,
    message: input.message ?? null,
    ipHash: input.ipHash ?? null,
    createdAt: new Date(),
  };

  const inserted = await db.insert(rsvps).values(row).returning();
  const created = inserted[0];
  if (!created) throw new Error('RSVP insert returned no row.');
  return created;
}

/** Replies to one invitation, only if the requesting user owns it. */
export async function listRsvpsForOwner(
  db: Database,
  invitationId: string,
  ownerId: string,
): Promise<Rsvp[]> {
  const rows = await db
    .select({ rsvp: rsvps })
    .from(rsvps)
    .innerJoin(invitations, eq(invitations.id, rsvps.invitationId))
    .where(and(eq(rsvps.invitationId, invitationId), eq(invitations.ownerId, ownerId)))
    .orderBy(desc(rsvps.createdAt));

  return rows.map((row) => row.rsvp);
}
