import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
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

/* -------------------------------------------------------------------------- */
/* Phase 6 additions: dashboard, anti-spam, retention                         */
/* -------------------------------------------------------------------------- */

export interface RsvpStats {
  /** Replies saying yes. */
  yes: number;
  /** Replies saying no. */
  no: number;
  /** Total replies. */
  replies: number;
  /** Heads expected: the sum of `guests` over the accepting replies. */
  people: number;
}

/** Counters for the dashboard, computed by the database. */
export async function rsvpStatsForOwner(
  db: Database,
  invitationId: string,
  ownerId: string,
): Promise<RsvpStats> {
  const rows = await db
    .select({
      yes: sql<number>`sum(case when ${rsvps.attending} = 1 then 1 else 0 end)`,
      no: sql<number>`sum(case when ${rsvps.attending} = 0 then 1 else 0 end)`,
      replies: sql<number>`count(*)`,
      people: sql<number>`coalesce(sum(case when ${rsvps.attending} = 1 then ${rsvps.guests} else 0 end), 0)`,
    })
    .from(rsvps)
    .innerJoin(invitations, eq(invitations.id, rsvps.invitationId))
    .where(and(eq(rsvps.invitationId, invitationId), eq(invitations.ownerId, ownerId)));

  const row = rows[0];
  return {
    yes: Number(row?.yes ?? 0),
    no: Number(row?.no ?? 0),
    replies: Number(row?.replies ?? 0),
    people: Number(row?.people ?? 0),
  };
}

/** Deletes one reply, but only from an invitation the user owns. */
export async function deleteRsvpForOwner(
  db: Database,
  rsvpId: string,
  invitationId: string,
  ownerId: string,
): Promise<boolean> {
  const owned = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.ownerId, ownerId)))
    .limit(1);

  if (owned.length === 0) return false;

  const deleted = await db
    .delete(rsvps)
    .where(and(eq(rsvps.id, rsvpId), eq(rsvps.invitationId, invitationId)))
    .returning({ id: rsvps.id });

  return deleted.length > 0;
}

/**
 * How many replies this hashed IP already sent to this invitation since
 * `since`. Backs the durable half of the anti-spam rule: the Workers rate
 * limiter is fast but its window is configured per Worker, this one is exact
 * and survives a change of isolate.
 */
export async function countRecentRsvpsByIp(
  db: Database,
  invitationId: string,
  ipHash: string,
  since: Date,
): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`count(*)` })
    .from(rsvps)
    .where(
      and(
        eq(rsvps.invitationId, invitationId),
        eq(rsvps.ipHash, ipHash),
        gte(rsvps.createdAt, since),
      ),
    );

  return Number(rows[0]?.total ?? 0);
}

/** Stamps a reply as notified, so a retry never mails the couple twice. */
export async function markRsvpNotified(
  db: Database,
  rsvpId: string,
  at: Date = new Date(),
): Promise<void> {
  await db.update(rsvps).set({ notifiedAt: at }).where(eq(rsvps.id, rsvpId));
}

/**
 * GDPR retention: removes every reply attached to an invitation whose event
 * date is strictly older than `cutoff` (`YYYY-MM-DD`).
 *
 * The event date lives inside the JSON content, so SQLite's `json_extract` is
 * what selects the invitations. ISO dates compare correctly as strings.
 */
export async function deleteRsvpsForEventsBefore(db: Database, cutoff: string): Promise<number> {
  const deleted = await db
    .delete(rsvps)
    .where(
      inArray(
        rsvps.invitationId,
        db
          .select({ id: invitations.id })
          .from(invitations)
          .where(sql`json_extract(${invitations.content}, '$.event.date') < ${cutoff}`),
      ),
    )
    .returning({ id: rsvps.id });

  return deleted.length;
}
