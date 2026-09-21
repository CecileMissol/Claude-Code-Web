import { eventInstant } from '@/content/derived';
import type { InvitationContent } from '@/content/schema';

/**
 * Time-zone aware instant of the event.
 *
 * `eventInstant()` (src/content/derived.ts) builds `new Date('YYYY-MM-DDTHH:MM')`,
 * which JavaScript reads in the *visitor's* zone: a guest in Montréal would see
 * a countdown six hours off. Phase 1 §1.3.2 flags this. The countdown must be
 * anchored on `content.event.timezone`, so this module re-projects that naive
 * wall-clock time into the event's zone, and falls back on `eventInstant()` when
 * the zone is unknown to the platform.
 *
 * `src/content/derived.ts` belongs to the shared layer, so the correction lives
 * here in the theme rather than being patched in place.
 */

/**
 * Offset, in milliseconds, between UTC and `timeZone` at the given instant.
 * Positive east of Greenwich (Europe/Paris in summer → +7 200 000).
 */
export function zoneOffsetMs(instant: Date, timeZone: string): number {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts: Record<string, number> = {};
  for (const part of format.formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }

  // `hour` can come back as 24 for midnight with hour12:false on some engines.
  const hour = (parts.hour ?? 0) % 24;

  const asUtc = Date.UTC(
    parts.year ?? 1970,
    (parts.month ?? 1) - 1,
    parts.day ?? 1,
    hour,
    parts.minute ?? 0,
    parts.second ?? 0,
  );

  return asUtc - instant.getTime();
}

/**
 * The instant the event starts, read in the event's own time zone.
 *
 * Two passes are enough to land on the right side of a DST change: the first
 * guess uses the offset at the naive instant, the second uses the offset that
 * actually applies at the guessed instant.
 */
export function zonedEventInstant(content: InvitationContent): Date {
  const [year, month, day] = content.event.date.split('-').map(Number);
  const [hour, minute] = content.event.time.split(':').map(Number);

  if (
    [year, month, day, hour, minute].some((value) => value === undefined || Number.isNaN(value))
  ) {
    return eventInstant(content);
  }

  const wallClockUtc = Date.UTC(year as number, (month as number) - 1, day as number, hour, minute);

  try {
    let instant = wallClockUtc - zoneOffsetMs(new Date(wallClockUtc), content.event.timezone);
    instant = wallClockUtc - zoneOffsetMs(new Date(instant), content.event.timezone);
    return new Date(instant);
  } catch {
    // Unknown IANA zone: fall back on the shared helper rather than crash.
    return eventInstant(content);
  }
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
