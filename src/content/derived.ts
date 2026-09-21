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

/** Instant of the event, used by the countdown and the .ics export. */
export function eventInstant(content: InvitationContent): Date {
  // Naive local time; the real time-zone conversion is handled when the .ics
  // export lands (phase 5). Good enough for a stable ISO string today.
  return new Date(`${content.event.date}T${content.event.time}:00`);
}

/** Explicit directions link, or one derived from the address. */
export function directionsUrl(content: InvitationContent): string {
  if (content.venue.mapsUrl) return content.venue.mapsUrl;

  const query = [content.venue.name, content.venue.addressLine, content.venue.city]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
