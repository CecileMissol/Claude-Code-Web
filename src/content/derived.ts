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

/** "12.06.27" */
export function shortDate(content: InvitationContent, separator = '.'): string {
  const [year = '', month = '', day = ''] = content.event.date.split('-');
  return [day, month, year.slice(2)].join(separator);
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

/**
 * Turns a wall-clock date (`YYYY-MM-DD`) and time (`HH:MM`) in an IANA zone
 * into the absolute instant it designates.
 *
 * Two passes settle DST transitions: the first guess uses the offset in force
 * at the naive instant, the second the offset actually in force at that guess.
 * Wall-clock times that do not exist (the spring-forward gap) land on the
 * instant just after the jump; ambiguous ones (autumn) resolve to the first
 * occurrence, which is what calendar software does.
 *
 * Falls back on the naive local instant when the zone is unknown.
 */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map((part) => Number.parseInt(part, 10));
  const [hour, minute] = time.split(':').map((part) => Number.parseInt(part, 10));

  if ([year, month, day, hour, minute].some((value) => value === undefined || Number.isNaN(value))) {
    return new Date(`${date}T${time}:00`);
  }

  const naive = Date.UTC(year as number, (month as number) - 1, day as number, hour, minute, 0);

  try {
    let instant = naive - zoneOffsetMs(new Date(naive), timeZone);
    instant = naive - zoneOffsetMs(new Date(instant), timeZone);
    return new Date(instant);
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
