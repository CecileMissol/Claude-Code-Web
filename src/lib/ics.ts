import type { InvitationContent } from '@/content/schema';
import { longDate, zoneOffsetMs, zonedTimeToUtc } from '@/content/derived';

/**
 * iCalendar (RFC 5545) generation, written by hand: the format we need is a
 * single VEVENT, and a dependency would cost more than these eighty lines.
 *
 * Time zones: the event is stored as a wall-clock date + time plus an IANA zone
 * (`content.event.timezone`). We convert that to an absolute instant and emit
 * `DTSTART` in UTC (`…Z`), which every calendar client understands without a
 * VTIMEZONE block. `X-WR-TIMEZONE` is added as a display hint.
 */

/** Default length of the event when nothing else says otherwise. */
export const DEFAULT_EVENT_HOURS = 8;

/* -------------------------------------------------------------------------- */
/* Time zones                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Both helpers live in `src/content/derived.ts`, the shared layer: the theme's
 * countdown and this export must agree on what instant the event starts at.
 * They are re-exported here so the .ics module keeps its own entry point.
 */
export { zonedTimeToUtc };
export const timeZoneOffsetMs = zoneOffsetMs;

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/** `20270612T123000Z` */
export function toIcsUtc(instant: Date): string {
  return `${instant
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')}`;
}

/** Escapes a TEXT value: backslash, semicolon, comma and newlines (RFC 5545 §3.3.11). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Folds a content line to 75 octets, continuation lines starting with a space
 * (RFC 5545 §3.1). Folding counts bytes, not characters, so accents count double.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentBytes + size > limit) {
      out.push(current);
      current = ' ';
      currentBytes = 1;
      limit = 75;
    }
    current += char;
    currentBytes += size;
  }
  out.push(current);

  return out.join('\r\n');
}

/* -------------------------------------------------------------------------- */
/* Event                                                                      */
/* -------------------------------------------------------------------------- */

export interface IcsEvent {
  /** Stable across regenerations: the same invitation always yields the same UID. */
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
  /** IANA zone, emitted as `X-WR-TIMEZONE` for clients that display it. */
  timeZone?: string;
  /** Overridable so tests get a deterministic `DTSTAMP`. */
  stamp?: Date;
}

/** Renders one VEVENT inside a VCALENDAR, CRLF-terminated as the RFC requires. */
export function buildIcs(event: IcsEvent): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitations//Invitation//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  if (event.timeZone) lines.push(`X-WR-TIMEZONE:${event.timeZone}`);

  lines.push(
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsUtc(event.stamp ?? new Date())}`,
    `DTSTART:${toIcsUtc(event.start)}`,
    `DTEND:${toIcsUtc(event.end)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
  );

  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  if (event.url) lines.push(`URL:${escapeIcsText(event.url)}`);

  lines.push('STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT', 'END:VCALENDAR');

  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

/* -------------------------------------------------------------------------- */
/* From invitation content                                                    */
/* -------------------------------------------------------------------------- */

const SUMMARY: Record<string, (names: string) => string> = {
  fr: (names) => `Mariage de ${names}`,
  en: (names) => `${names}'s wedding`,
};

const DESCRIPTION: Record<string, (date: string, url: string) => string> = {
  fr: (date, url) => `${date}\nL'invitation : ${url}`,
  en: (date, url) => `${date}\nThe invitation: ${url}`,
};

export interface InvitationIcsOptions {
  /** Public slug; also used to build a stable UID. */
  slug: string;
  /** Public URL of the invitation, put in `URL:` and in the description. */
  url: string;
  /** Host part of the UID, e.g. `invitations.example`. Derived from `url` when absent. */
  uidHost?: string;
  hours?: number;
  stamp?: Date;
}

/** Full address of the venue, on one line. */
export function venueLocation(content: InvitationContent): string {
  return [content.venue.name, content.venue.addressLine, content.venue.city, content.venue.country]
    .map((part) => (part ?? '').trim())
    .filter((part) => part.length > 0)
    .join(', ');
}

/** Builds the calendar file a guest downloads from the invitation. */
export function invitationIcs(
  content: InvitationContent,
  options: InvitationIcsOptions,
): { filename: string; body: string } {
  const { timezone } = content.event;
  const start = zonedTimeToUtc(content.event.date, content.event.time, timezone);
  const end = new Date(start.getTime() + (options.hours ?? DEFAULT_EVENT_HOURS) * 3600_000);

  const names = `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`;
  const locale = content.locale;

  let host = options.uidHost;
  if (!host) {
    try {
      host = new URL(options.url).host;
    } catch {
      host = 'invitations.local';
    }
  }

  return {
    filename: `${options.slug}.ics`,
    body: buildIcs({
      uid: `invitation-${options.slug}@${host}`,
      start,
      end,
      summary: (SUMMARY[locale] ?? SUMMARY.en!)(names),
      description: (DESCRIPTION[locale] ?? DESCRIPTION.en!)(longDate(content), options.url),
      location: venueLocation(content),
      url: options.url,
      timeZone: timezone,
      stamp: options.stamp,
    }),
  };
}
