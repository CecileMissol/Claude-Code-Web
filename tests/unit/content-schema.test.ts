import { describe, expect, it } from 'vitest';
import { CONTENT_VERSION, InvitationContent, parseContent } from '@/content/schema';
import { defaultContent } from '@/content/defaults';

describe('InvitationContent', () => {
  it('accepts the default draft in both locales', () => {
    for (const locale of ['en', 'fr'] as const) {
      const content = defaultContent(locale);
      expect(content.locale).toBe(locale);
      expect(content.version).toBe(CONTENT_VERSION);
      expect(() => parseContent(content)).not.toThrow();
    }
  });

  it('applies its defaults', () => {
    const parsed = parseContent({
      version: CONTENT_VERSION,
      locale: 'fr',
      eventType: 'wedding',
      couple: { partner1: { firstName: 'Zoé' }, partner2: { firstName: 'Dylan' } },
      event: { date: '2027-06-12' },
      venue: { name: 'Domaine', city: 'Lourmarin' },
      story: { lines: ['Une ligne'] },
      dateChapter: { lines: ['Sortez votre agenda.'] },
      program: { items: [{ time: '14:30', title: 'Cérémonie' }] },
      place: {},
      rsvp: {},
      signature: {},
      style: { paletteId: 'noir', scriptId: 'pinyon' },
    });

    expect(parsed.event.time).toBe('14:30');
    expect(parsed.event.timezone).toBe('Europe/Paris');
    expect(parsed.rsvp.maxGuestsPerReply).toBe(5);
    expect(parsed.rsvp.enabled).toBe(true);
    expect(parsed.photos).toEqual({});
    expect(parsed.extras).toEqual({});
    expect(parsed.info).toEqual([]);
  });

  it('rejects a malformed date', () => {
    const base = defaultContent('fr');
    const broken = { ...base, event: { ...base.event, date: '12/06/2027' } };
    expect(InvitationContent.safeParse(broken).success).toBe(false);
  });

  it('rejects an unsupported locale', () => {
    const base = defaultContent('fr');
    expect(InvitationContent.safeParse({ ...base, locale: 'de' }).success).toBe(false);
  });

  it('rejects too many story lines', () => {
    const base = defaultContent('fr');
    const broken = {
      ...base,
      story: { ...base.story, lines: Array.from({ length: 7 }, (_, i) => `ligne ${i}`) },
    };
    expect(InvitationContent.safeParse(broken).success).toBe(false);
  });

  it('trims text fields', () => {
    const base = defaultContent('en');
    const parsed = parseContent({
      ...base,
      couple: { partner1: { firstName: '  Zoé  ' }, partner2: { firstName: 'Dylan' } },
    });
    expect(parsed.couple.partner1.firstName).toBe('Zoé');
  });
});
