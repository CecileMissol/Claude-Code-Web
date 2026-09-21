import { describe, expect, it } from 'vitest';
import { InvitationContent } from '@/content/schema';
import { eventInstant, zoneOffsetMs, zonedTimeToUtc } from '@/content/derived';
import demo from '@/themes/mariage-noir-ivoire/demo.json';

/**
 * `eventInstant()` is the single conversion "wall-clock date + time + IANA zone
 * → instant" used by the countdown of every theme and by the .ics export.
 * These tests pin the behaviour across DST boundaries and hemispheres.
 */

const base = InvitationContent.parse(demo);

function withEvent(overrides: Partial<InvitationContent['event']>): InvitationContent {
  return { ...base, event: { ...base.event, ...overrides } };
}

describe('zoneOffsetMs', () => {
  it('reads a positive offset east of Greenwich (Paris, summer)', () => {
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'Europe/Paris')).toBe(2 * 3600_000);
  });

  it('follows daylight saving (Paris, winter)', () => {
    expect(zoneOffsetMs(new Date('2027-01-15T12:00:00Z'), 'Europe/Paris')).toBe(3600_000);
  });

  it('reads a negative offset west of Greenwich', () => {
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'America/New_York')).toBe(-4 * 3600_000);
    expect(zoneOffsetMs(new Date('2027-01-15T12:00:00Z'), 'America/New_York')).toBe(-5 * 3600_000);
  });

  it('follows the southern hemisphere, where summer is in January', () => {
    expect(zoneOffsetMs(new Date('2027-01-15T12:00:00Z'), 'Pacific/Auckland')).toBe(13 * 3600_000);
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'Pacific/Auckland')).toBe(12 * 3600_000);
  });

  it('handles a half-hour zone', () => {
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'Asia/Kolkata')).toBe(5.5 * 3600_000);
  });

  it('is zero for UTC, whatever the date', () => {
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'UTC')).toBe(0);
    expect(zoneOffsetMs(new Date('2027-01-15T00:00:00Z'), 'UTC')).toBe(0);
  });

  it('is right at midnight, where some engines report hour 24', () => {
    expect(zoneOffsetMs(new Date('2027-06-11T22:00:00Z'), 'Europe/Paris')).toBe(2 * 3600_000);
  });

  it('throws on an unknown zone', () => {
    expect(() => zoneOffsetMs(new Date(), 'Mars/Olympus')).toThrow();
  });
});

describe('zonedTimeToUtc', () => {
  it('reads a summer wall clock in Paris (UTC+2)', () => {
    expect(zonedTimeToUtc('2027-06-12', '14:30', 'Europe/Paris').toISOString()).toBe(
      '2027-06-12T12:30:00.000Z',
    );
  });

  it('reads a winter wall clock in Paris (UTC+1)', () => {
    expect(zonedTimeToUtc('2027-01-12', '14:30', 'Europe/Paris').toISOString()).toBe(
      '2027-01-12T13:30:00.000Z',
    );
  });

  it('reads New York, both sides of daylight saving', () => {
    expect(zonedTimeToUtc('2027-06-12', '14:30', 'America/New_York').toISOString()).toBe(
      '2027-06-12T18:30:00.000Z',
    );
    expect(zonedTimeToUtc('2027-01-12', '14:30', 'America/New_York').toISOString()).toBe(
      '2027-01-12T19:30:00.000Z',
    );
  });

  it('reads Auckland, where the clocks move the other way', () => {
    // NZDT (UTC+13) in January, NZST (UTC+12) in June.
    expect(zonedTimeToUtc('2027-01-12', '14:30', 'Pacific/Auckland').toISOString()).toBe(
      '2027-01-12T01:30:00.000Z',
    );
    expect(zonedTimeToUtc('2027-06-12', '14:30', 'Pacific/Auckland').toISOString()).toBe(
      '2027-06-12T02:30:00.000Z',
    );
  });

  it('lands after the jump for a wall-clock time that does not exist', () => {
    // 28 March 2027, 02:30 Paris: the clocks go straight from 02:00 to 03:00.
    const instant = zonedTimeToUtc('2027-03-28', '02:30', 'Europe/Paris');
    expect(Number.isNaN(instant.getTime())).toBe(false);
    expect(instant.toISOString()).toBe('2027-03-28T01:30:00.000Z');
  });

  it('takes the first occurrence of an ambiguous wall-clock time', () => {
    // 31 October 2027, 02:30 Paris happens twice; CEST (UTC+2) comes first.
    expect(zonedTimeToUtc('2027-10-31', '02:30', 'Europe/Paris').toISOString()).toBe(
      '2027-10-31T00:30:00.000Z',
    );
  });

  it('is stable when called twice', () => {
    expect(zonedTimeToUtc('2027-06-12', '14:30', 'Europe/Paris').getTime()).toBe(
      zonedTimeToUtc('2027-06-12', '14:30', 'Europe/Paris').getTime(),
    );
  });

  it('falls back on a naive reading rather than crashing on an unknown zone', () => {
    const instant = zonedTimeToUtc('2027-06-12', '14:30', 'Mars/Olympus');
    expect(Number.isNaN(instant.getTime())).toBe(false);
  });
});

describe('eventInstant', () => {
  it('uses the zone stored in the content, not the runtime zone', () => {
    expect(
      eventInstant(
        withEvent({ date: '2027-06-12', time: '14:30', timezone: 'Europe/Paris' }),
      ).toISOString(),
    ).toBe('2027-06-12T12:30:00.000Z');

    expect(
      eventInstant(
        withEvent({ date: '2027-06-12', time: '14:30', timezone: 'America/New_York' }),
      ).toISOString(),
    ).toBe('2027-06-12T18:30:00.000Z');

    expect(
      eventInstant(
        withEvent({ date: '2027-06-12', time: '14:30', timezone: 'Pacific/Auckland' }),
      ).toISOString(),
    ).toBe('2027-06-12T02:30:00.000Z');
  });

  it('never returns an invalid date for an unknown zone', () => {
    const instant = eventInstant(withEvent({ timezone: 'Nowhere/Nothing' }));
    expect(Number.isNaN(instant.getTime())).toBe(false);
  });
});
