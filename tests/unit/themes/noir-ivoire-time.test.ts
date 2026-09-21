import { describe, expect, it } from 'vitest';
import { InvitationContent } from '@/content/schema';
import demo from '@/themes/mariage-noir-ivoire/demo.json';
import {
  isDeadlinePassed,
  isRsvpOpen,
  remainingMs,
  zoneOffsetMs,
  zonedEventInstant,
} from '@/themes/mariage-noir-ivoire/animations/time';

/**
 * The countdown must show the same figures to every guest, wherever they are.
 * These tests pin the time-zone handling flagged in phase 1, §1.3.2.
 */

const base = InvitationContent.parse(demo);

function withEvent(overrides: Partial<InvitationContent['event']>): InvitationContent {
  return { ...base, event: { ...base.event, ...overrides } };
}

describe('zoneOffsetMs', () => {
  it('reads a positive offset east of Greenwich', () => {
    // 12 June 2027, Paris is on CEST (UTC+2).
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'Europe/Paris')).toBe(2 * 3600_000);
  });

  it('follows daylight saving', () => {
    expect(zoneOffsetMs(new Date('2027-01-15T12:00:00Z'), 'Europe/Paris')).toBe(3600_000);
  });

  it('reads a negative offset west of Greenwich', () => {
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'America/New_York')).toBe(-4 * 3600_000);
  });

  it('is zero for UTC', () => {
    expect(zoneOffsetMs(new Date('2027-06-12T12:00:00Z'), 'UTC')).toBe(0);
  });
});

describe('zonedEventInstant', () => {
  it('anchors the event on its own time zone, not the visitor’s', () => {
    // 12 June 2027, 14:30 in Paris (UTC+2) is 12:30 UTC.
    expect(zonedEventInstant(base).toISOString()).toBe('2027-06-12T12:30:00.000Z');
  });

  it('gives the same instant whatever the guest’s clock', () => {
    // The function never reads the local zone, so the result is absolute.
    const first = zonedEventInstant(base).getTime();
    const second = zonedEventInstant({ ...base }).getTime();
    expect(first).toBe(second);
  });

  it('handles a zone west of Greenwich', () => {
    const content = withEvent({ timezone: 'America/New_York' });
    // 14:30 in New York on 12 June 2027 (EDT, UTC-4) is 18:30 UTC.
    expect(zonedEventInstant(content).toISOString()).toBe('2027-06-12T18:30:00.000Z');
  });

  it('handles a winter date, on the other side of the DST switch', () => {
    const content = withEvent({ date: '2027-01-16', timezone: 'Europe/Paris' });
    expect(zonedEventInstant(content).toISOString()).toBe('2027-01-16T13:30:00.000Z');
  });

  it('honours a custom time', () => {
    const content = withEvent({ time: '09:05' });
    expect(zonedEventInstant(content).toISOString()).toBe('2027-06-12T07:05:00.000Z');
  });

  it('falls back instead of throwing on an unknown zone', () => {
    const content = withEvent({ timezone: 'Mars/Olympus_Mons' });
    expect(Number.isNaN(zonedEventInstant(content).getTime())).toBe(false);
  });
});

describe('remainingMs', () => {
  it('counts down to the event', () => {
    const now = new Date('2027-06-11T12:30:00Z');
    expect(remainingMs(base, now)).toBe(24 * 3600_000);
  });

  it('floors at zero once the event has started', () => {
    expect(remainingMs(base, new Date('2030-01-01T00:00:00Z'))).toBe(0);
  });
});

describe('RSVP deadline', () => {
  const withDeadline = (deadline?: string): InvitationContent => ({
    ...base,
    rsvp: { ...base.rsvp, deadline },
  });

  it('is never passed when no deadline is set', () => {
    expect(isDeadlinePassed(base, new Date('2099-01-01T00:00:00Z'))).toBe(false);
  });

  it('stays open all through the deadline day, in the event’s zone', () => {
    const content = withDeadline('2027-05-01');
    // 23:00 UTC on 1 May is 01:00 on 2 May in Paris — already past.
    expect(isDeadlinePassed(content, new Date('2027-05-01T12:00:00Z'))).toBe(false);
    expect(isDeadlinePassed(content, new Date('2027-05-01T21:59:00Z'))).toBe(false);
    expect(isDeadlinePassed(content, new Date('2027-05-02T00:00:00Z'))).toBe(true);
  });

  it('closes the form once the deadline has passed', () => {
    const content = withDeadline('2027-05-01');
    expect(isRsvpOpen(content, new Date('2027-04-30T10:00:00Z'))).toBe(true);
    expect(isRsvpOpen(content, new Date('2027-06-01T10:00:00Z'))).toBe(false);
  });

  it('closes the form when RSVP is disabled altogether', () => {
    const disabled: InvitationContent = { ...base, rsvp: { ...base.rsvp, enabled: false } };
    expect(isRsvpOpen(disabled, new Date('2027-01-01T00:00:00Z'))).toBe(false);
  });
});
