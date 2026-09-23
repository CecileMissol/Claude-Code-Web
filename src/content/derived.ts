import type { InvitationContent } from './schema';

/**
 * Values derived from the content and never stored in the database:
 * initials, short/long dates, postmark date, directions URL.
 */

/** "Z&D" */
export function initials(content: InvitationContent): string {
  const a = content.couple.partner1.firstName.charAt(0).toUpperCase();
  const b = content.couple.partner2.firstName.charAt(0).toUpperCase();
  return `${a}&${b}`;
}

/**
 * The three numbers of the short date, **in the reading order of the
 * invitation's locale**: `[day, month, yy]` in French, `[month, day, yy]` in
 * English.
 *
 * `12.06.27` reads as 12 June to a French guest and as 6 December to an
 * American one — and the American market is the one the themes are sold on
 * (BRIEF §2). The order is decided here, once, so the envelope, the "save the
 * date" ticket and the three papers of the Date chapter can never disagree
 * with each other.
 *
 * The year is always last: no locale puts it in the middle.
 */
export function shortDateParts(content: InvitationContent): [string, string, string] {
  const [year = '', month = '', day = ''] = content.event.date.split('-');
  const yy = year.slice(2);
  return content.locale === 'en' ? [month, day, yy] : [day, month, yy];
}

/** "12.06.27" (fr) · "06.12.27" (en) — see `shortDateParts`. */
export function shortDate(content: InvitationContent, separator = '.'): string {
  return shortDateParts(content).join(separator);
}

const ROMAN_MONTHS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
] as const;

/** "12·VI·27", as printed on the postmark. */
export function postmarkDate(content: InvitationContent): string {
  const [year = '', month = '', day = ''] = content.event.date.split('-');
  const roman = ROMAN_MONTHS[Number.parseInt(month, 10) - 1] ?? month;
  return `${day}·${roman}·${year.slice(2)}`;
}

/** "Samedi 12 juin 2027" / "Saturday 12 June 2027", in the invitation locale. */
export function longDate(content: InvitationContent): string {
  const date = new Date(`${content.event.date}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return content.event.date;

  const formatted = new Intl.DateTimeFormat(content.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Time zones                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Offset between UTC and `timeZone` at `instant`, in milliseconds, positive
 * east of Greenwich (Europe/Paris in summer → +7 200 000).
 *
 * `Intl.DateTimeFormat` is the only time-zone database the platform gives us;
 * formatting the instant *in* the zone and reading the result back as if it
 * were UTC yields the offset, with no dependency.
 *
 * Throws `RangeError` when the zone is unknown to the platform.
 */
export function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    return part ? Number.parseInt(part.value, 10) : 0;
  };

  const asIfUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    // `hour` comes back as 24 for midnight on some engines despite `h23`.
    read('hour') % 24,
    read('minute'),
    read('second'),
  );

  return asIfUtc - instant.getTime();
}

const DAY_MS = 86_400_000;

/**
 * Turns a wall-clock date (`YYYY-MM-DD`) and time (`HH:MM`) in an IANA zone
 * into the absolute instant it designates.
 *
 * A wall clock is not always a single instant. We therefore build the two
 * candidates that the offsets in force a day before and a day after the date
 * allow, then keep the ones that really read back as the requested wall clock:
 *
 * - normal day — both candidates collapse onto the same instant;
 * - autumn, clocks back — both are valid (02:30 happens twice); we keep the
 *   first occurrence, as calendar software does;
 * - spring, clocks forward — neither is valid (02:30 never happens); we keep
 *   the later one, so the time shifts forward past the gap (02:30 → 03:30)
 *   instead of silently moving to the day before.
 *
 * Falls back on the naive local instant when the zone is unknown.
 */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map((part) => Number.parseInt(part, 10));
  const [hour, minute] = time.split(':').map((part) => Number.parseInt(part, 10));

  if (
    [year, month, day, hour, minute].some((value) => value === undefined || Number.isNaN(value))
  ) {
    return new Date(`${date}T${time}:00`);
  }

  const wallClock = Date.UTC(year as number, (month as number) - 1, day as number, hour, minute, 0);

  try {
    const offsets = [
      zoneOffsetMs(new Date(wallClock - DAY_MS), timeZone),
      zoneOffsetMs(new Date(wallClock + DAY_MS), timeZone),
    ];
    const earlier = wallClock - Math.max(...offsets);
    const later = wallClock - Math.min(...offsets);

    // A candidate is right when reading it back in the zone gives the wall
    // clock we started from.
    const reads = (instant: number): boolean =>
      instant + zoneOffsetMs(new Date(instant), timeZone) === wallClock;

    if (reads(earlier)) return new Date(earlier);
    return new Date(later);
  } catch {
    // Unknown IANA zone: the naive reading is better than a crash.
    return new Date(`${date}T${time}:00`);
  }
}

/**
 * Instant of the event, used by the countdown, the theme and the .ics export.
 *
 * The content stores a wall-clock date and time plus `event.timezone`: the
 * ceremony starts at 14:30 *where it happens*, whatever zone the guest reads
 * the invitation from.
 */
export function eventInstant(content: InvitationContent): Date {
  return zonedTimeToUtc(content.event.date, content.event.time, content.event.timezone);
}

/** Explicit directions link, or one derived from the address. */
export function directionsUrl(content: InvitationContent): string {
  if (content.venue.mapsUrl) return content.venue.mapsUrl;

  const query = [content.venue.name, content.venue.addressLine, content.venue.city]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
