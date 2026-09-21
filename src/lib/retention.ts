import type { Database } from '@/db';
import { getDbAsync } from '@/db';
import { deleteRsvpsForEventsBefore, expireDuePublications } from '@/db/queries';
import { addMonths } from './publish';

/**
 * GDPR retention (BRIEF §9).
 *
 * Guest replies carry personal data (name, e-mail, dietary requirements), so
 * they are deleted automatically once the event is well behind us. The same
 * pass closes the hosting window of invitations that have reached their expiry
 * date, which keeps `/[slug]` honest even between two visits.
 *
 * Triggered by `/api/cron/retention` (see `docs/phase-5-6-publication-rsvp.md`
 * for why that route exists instead of a Worker `scheduled` handler).
 */

/** Replies are kept this many months after the event date. */
export const RSVP_RETENTION_MONTHS = 6;

/** `YYYY-MM-DD` of the oldest event whose replies are still kept. */
export function retentionCutoff(
  now: Date = new Date(),
  months: number = RSVP_RETENTION_MONTHS,
): string {
  return addMonths(now, -months).toISOString().slice(0, 10);
}

export interface PurgeReport {
  /** Replies deleted. */
  deletedRsvps: number;
  /** Invitations moved from `published` to `expired`. */
  expiredInvitations: number;
  /** Cut-off date used, for the log. */
  cutoff: string;
}

/**
 * Deletes every reply whose event happened more than
 * {@link RSVP_RETENTION_MONTHS} ago, and expires the publications that are due.
 * Idempotent: running it twice in a row changes nothing the second time.
 */
export async function purgeExpiredRsvps(
  db?: Database,
  now: Date = new Date(),
  months: number = RSVP_RETENTION_MONTHS,
): Promise<PurgeReport> {
  const handle = db ?? (await getDbAsync());
  const cutoff = retentionCutoff(now, months);

  const deletedRsvps = await deleteRsvpsForEventsBefore(handle, cutoff);
  const expiredInvitations = await expireDuePublications(handle, now);

  return { deletedRsvps, expiredInvitations, cutoff };
}

/**
 * Shared secret protecting `/api/cron/retention`.
 * Falls back to nothing: the route then refuses every call, which is the safe
 * default for a job that deletes rows.
 */
export function cronSecret(): string | null {
  const value = process.env.CRON_SECRET?.trim();
  return value && value.length >= 16 ? value : null;
}

/** Constant-time-ish comparison of two short secrets. */
export function secretMatches(provided: string | null | undefined, expected: string): boolean {
  if (!provided || provided.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
