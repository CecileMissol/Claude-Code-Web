import { eventInstant, zoneOffsetMs } from '@/content/derived';
import type { InvitationContent } from '@/content/schema';

/**
 * Time helpers for the countdown and the RSVP deadline.
 *
 * The wall-clock date + time stored in the content is turned into an absolute
 * instant by `eventInstant()` (`src/content/derived.ts`), which reads it in
 * `content.event.timezone`: the ceremony starts at 14:30 *where it happens*,
 * whatever zone the guest is in. This module only re-exports that shared
 * conversion so the theme keeps a single, stable entry point.
 */

export { zoneOffsetMs };

/** The instant the event starts, read in the event's own time zone. */
export function zonedEventInstant(content: InvitationContent): Date {
  return eventInstant(content);
}

/** Milliseconds left before the event, floored at zero. */
export function remainingMs(content: InvitationContent, now: Date = new Date()): number {
  return Math.max(0, zonedEventInstant(content).getTime() - now.getTime());
}

/**
 * `true` once the RSVP deadline has passed. The deadline is a calendar day and
 * is inclusive: replies close at the end of that day, in the event's zone.
 */
export function isDeadlinePassed(content: InvitationContent, now: Date = new Date()): boolean {
  const deadline = content.rsvp.deadline;
  if (!deadline) return false;

  const [year, month, day] = deadline.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;

  const endOfDayUtc = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  try {
    let instant = endOfDayUtc - zoneOffsetMs(new Date(endOfDayUtc), content.event.timezone);
    instant = endOfDayUtc - zoneOffsetMs(new Date(instant), content.event.timezone);
    return now.getTime() > instant;
  } catch {
    return now.getTime() > endOfDayUtc;
  }
}

/** `true` when the RSVP form should be shown at all. */
export function isRsvpOpen(content: InvitationContent, now: Date = new Date()): boolean {
  return content.rsvp.enabled && !isDeadlinePassed(content, now);
}
