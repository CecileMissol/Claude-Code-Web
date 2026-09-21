import type { Invitation, InvitationStatus } from '@/db/schema';
import { getEnv } from './env';
import { RESERVED_SLUGS, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, isSlugAvailableShape } from './slugs';

/**
 * Publication rules.
 *
 * Publishing an invitation does three things: it fixes a public slug, it flips
 * the status to `published`, and it starts the hosting clock. Nothing here
 * touches the database — `src/db/queries/publish.ts` does, and this module
 * stays pure so it can be unit-tested without a binding.
 */

/**
 * Hosting included with a purchase, in months, counted from the day the
 * invitation is published. Extending it is a paid option (see BRIEF §3).
 */
export const HOSTING_MONTHS = 18;

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Adds whole months to an instant, clamping the day when the target month is
 * shorter (31 January + 1 month = 28/29 February).
 */
export function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const target = new Date(
    Date.UTC(
      year,
      month + months,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );

  const daysInTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(day, daysInTargetMonth));
  return target;
}

/**
 * Today's date (`YYYY-MM-DD`) as seen from an IANA time zone.
 * Used to decide whether an RSVP deadline has passed where the event happens,
 * not where the guest is.
 */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** True when an RSVP deadline (`YYYY-MM-DD`, inclusive) is behind us. */
export function isDeadlinePassed(
  deadline: string | undefined,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  if (!deadline) return false;
  return todayInTimeZone(timeZone, now) > deadline;
}

/** Expiry date of an invitation published at `publishedAt`. */
export function hostingExpiry(publishedAt: Date, months: number = HOSTING_MONTHS): Date {
  return addMonths(publishedAt, months);
}

/* -------------------------------------------------------------------------- */
/* Slug validation                                                            */
/* -------------------------------------------------------------------------- */

export type SlugProblem =
  'empty' | 'too_short' | 'too_long' | 'invalid_characters' | 'reserved' | 'taken';

export interface SlugVerdict {
  ok: boolean;
  /** Only set when `ok` is false. */
  problem?: SlugProblem;
}

/**
 * Shape-only check: length, allowed characters, reserved words.
 * Availability in the database is checked separately (it needs a query).
 */
export function checkSlugShape(raw: string): SlugVerdict {
  const slug = raw.trim().toLowerCase();

  if (slug.length === 0) return { ok: false, problem: 'empty' };
  if (slug.length < SLUG_MIN_LENGTH) return { ok: false, problem: 'too_short' };
  if (slug.length > SLUG_MAX_LENGTH) return { ok: false, problem: 'too_long' };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, problem: 'reserved' };
  if (!isSlugAvailableShape(slug)) return { ok: false, problem: 'invalid_characters' };

  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* URLs                                                                       */
/* -------------------------------------------------------------------------- */

/** Application origin, without a trailing slash. */
export function appOrigin(): string {
  return getEnv().APP_URL.replace(/\/+$/, '');
}

/** Public URL a guest opens: `https://domain.tld/zoe-et-dylan`. */
export function publicInvitationUrl(slug: string): string {
  return `${appOrigin()}/${slug}`;
}

/** Calendar file URL for a published invitation. */
export function icsUrl(slug: string): string {
  return `${appOrigin()}/api/ics/${slug}`;
}

/** Server-rendered QR code (SVG) for a published invitation. */
export function qrUrl(slug: string): string {
  return `${appOrigin()}/api/qr/${slug}`;
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Effective status of an invitation.
 *
 * A row can still read `published` in the database while its hosting window has
 * closed — the nightly retention job flips it, but a request may arrive first,
 * so the expiry date is always re-checked at read time.
 */
export function effectiveStatus(
  invitation: Pick<Invitation, 'status' | 'expiresAt' | 'slug'>,
  now: Date = new Date(),
): InvitationStatus {
  if (invitation.status === 'published') {
    if (invitation.expiresAt && invitation.expiresAt.getTime() <= now.getTime()) return 'expired';
    return 'published';
  }
  return invitation.status;
}

/** True when a guest may see the invitation behind its slug. */
export function isPubliclyVisible(
  invitation: Pick<Invitation, 'status' | 'expiresAt' | 'slug'>,
  now: Date = new Date(),
): boolean {
  return effectiveStatus(invitation, now) === 'published';
}

/**
 * Why an invitation cannot be published yet, or `null` when it can.
 * A slug is the only hard requirement: content is always schema-valid by the
 * time it is stored.
 */
export function publishBlocker(
  invitation: Pick<Invitation, 'slug'>,
): 'missing_slug' | 'invalid_slug' | null {
  if (!invitation.slug) return 'missing_slug';
  return checkSlugShape(invitation.slug).ok ? null : 'invalid_slug';
}
