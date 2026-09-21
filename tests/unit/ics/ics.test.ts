import { describe, expect, it } from 'vitest';
import { defaultContent } from '@/content/defaults';
import type { InvitationContent } from '@/content/schema';
import {
  buildIcs,
  escapeIcsText,
  foldIcsLine,
  invitationIcs,
  timeZoneOffsetMs,
  toIcsUtc,
  venueLocation,
  zonedTimeToUtc,
} from '@/lib/ics';

const STAMP = new Date('2026-09-21T09:00:00Z');

function content(overrides: Partial<InvitationContent> = {}): InvitationContent {
  return { ...defaultContent('fr'), ...overrides } as InvitationContent;
}

/** Unfolds a rendered calendar back into logical lines. */
function lines(body: string): string[] {
  return body.replace(/\r\n[ \t]/g, '').split('\r\n');
}

describe('time zones', () => {
  it('knows the offset of a zone at a given instant', () => {
    expect(timeZoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'Europe/Paris')).toBe(2 * 3600_000);
    expect(timeZoneOffsetMs(new Date('2027-01-12T12:00:00Z'), 'Europe/Paris')).toBe(1 * 3600_000);
    expect(timeZoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'UTC')).toBe(0);
  });

  it('turns a wall-clock time in a zone into the right instant', () => {
    // 14:30 in Paris in June is CEST (+02:00).
    expect(zonedTimeToUtc('2027-06-12', '14:30', 'Europe/Paris').toISOString()).toBe(
      '2027-06-12T12:30:00.000Z',
    );
    // The same wall clock in January is CET (+01:00).
    expect(zonedTimeToUtc('2027-01-12', '14:30', 'Europe/Paris').toISOString()).toBe(
      '2027-01-12T13:30:00.000Z',
    );
    // A guest in another zone must get the same instant.
    expect(zonedTimeToUtc('2027-06-12', '14:30', 'America/New_York').toISOString()).toBe(
      '2027-06-12T18:30:00.000Z',
    );
  });

  it('settles on one side of a DST jump instead of looping', () => {
    // 02:30 on 28 March 2027 does not exist in Paris (clocks go 02:00 → 03:00).
    const instant = zonedTimeToUtc('2027-03-28', '02:30', 'Europe/Paris');
    expect(Number.isNaN(instant.getTime())).toBe(false);
    expect(instant.toISOString()).toBe('2027-03-28T01:30:00.000Z');
  });
});

describe('formatting', () => {
  it('writes UTC stamps the way the RFC wants them', () => {
    expect(toIcsUtc(new Date('2027-06-12T12:30:00Z'))).toBe('20270612T123000Z');
  });

  it('escapes the four characters that would break a TEXT value', () => {
    expect(escapeIcsText('a, b; c \\ d\ne')).toBe('a\\, b\\; c \\\\ d\\ne');
  });

  it('folds long lines at 75 octets with a leading space', () => {
    const folded = foldIcsLine(`DESCRIPTION:${'a'.repeat(200)}`);
    for (const line of folded.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(
      folded
        .split('\r\n')
        .slice(1)
        .every((line) => line.startsWith(' ')),
    ).toBe(true);
    expect(folded.replace(/\r\n /g, '')).toBe(`DESCRIPTION:${'a'.repeat(200)}`);
  });

  it('counts octets, not characters, when folding accented text', () => {
    const folded = foldIcsLine(`SUMMARY:${'é'.repeat(80)}`);
    for (const line of folded.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe('calendar file', () => {
  it('renders a complete, single-event calendar', () => {
    const body = buildIcs({
      uid: 'invitation-zoe-et-dylan@example.test',
      start: new Date('2027-06-12T12:30:00Z'),
      end: new Date('2027-06-12T20:30:00Z'),
      summary: 'Mariage de Zoé & Dylan',
      location: 'Le domaine, Lourmarin',
      timeZone: 'Europe/Paris',
      stamp: STAMP,
    });

    const rendered = lines(body);
    expect(rendered[0]).toBe('BEGIN:VCALENDAR');
    expect(rendered).toContain('VERSION:2.0');
    expect(rendered).toContain('X-WR-TIMEZONE:Europe/Paris');
    expect(rendered).toContain('UID:invitation-zoe-et-dylan@example.test');
    expect(rendered).toContain('DTSTAMP:20260921T090000Z');
    expect(rendered).toContain('DTSTART:20270612T123000Z');
    expect(rendered).toContain('DTEND:20270612T203000Z');
    expect(rendered).toContain('END:VCALENDAR');
    expect(body.endsWith('\r\n')).toBe(true);
    // Exactly one event.
    expect(rendered.filter((line) => line === 'BEGIN:VEVENT')).toHaveLength(1);
  });
});

describe('invitation to calendar', () => {
  const base = content({
    event: { date: '2027-06-12', time: '14:30', timezone: 'Europe/Paris' },
    venue: {
      name: 'Le domaine',
      addressLine: 'Chemin des oliviers',
      city: 'Lourmarin',
      country: 'France',
      photoSlot: 'venue',
    },
  });

  it('uses the event time zone, the venue and a stable UID', () => {
    const { filename, body } = invitationIcs(base, {
      slug: 'zoe-et-dylan',
      url: 'https://example.test/zoe-et-dylan',
      stamp: STAMP,
    });

    expect(filename).toBe('zoe-et-dylan.ics');

    const rendered = lines(body);
    expect(rendered).toContain('DTSTART:20270612T123000Z');
    expect(rendered).toContain('UID:invitation-zoe-et-dylan@example.test');
    expect(rendered).toContain('URL:https://example.test/zoe-et-dylan');
    expect(rendered).toContain('LOCATION:Le domaine\\, Chemin des oliviers\\, Lourmarin\\, France');
    expect(rendered.some((line) => line.startsWith('SUMMARY:Mariage de'))).toBe(true);
  });

  it('gives the very same UID on every regeneration', () => {
    const options = { slug: 'zoe-et-dylan', url: 'https://example.test/zoe-et-dylan' };
    const first = lines(invitationIcs(base, options).body).find((line) => line.startsWith('UID:'));
    const second = lines(invitationIcs(base, options).body).find((line) => line.startsWith('UID:'));
    expect(first).toBe(second);
  });

  it('writes the summary in the invitation locale', () => {
    const english = invitationIcs(
      { ...base, locale: 'en' },
      {
        slug: 'alex-and-sam',
        url: 'https://example.test/alex-and-sam',
        stamp: STAMP,
      },
    );
    expect(lines(english.body).some((line) => line.startsWith("SUMMARY:Alex & Sam's"))).toBe(true);
  });

  it('joins the venue into one line and skips what is empty', () => {
    expect(venueLocation(base)).toBe('Le domaine, Chemin des oliviers, Lourmarin, France');
    expect(
      venueLocation(
        content({ venue: { name: 'Ici', addressLine: '', city: 'Paris', photoSlot: 'venue' } }),
      ),
    ).toBe('Ici, Paris');
  });
});
