import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { shortDate, shortDateParts } from '@/content/derived';
import { InvitationContent } from '@/content/schema';
import noirDemo from '@/themes/mariage-noir-ivoire/demo.json';
import NoirInvitation from '@/themes/mariage-noir-ivoire/Invitation';
import terracottaDemo from '@/themes/mariage-terracotta-bloom/demo.json';
import TerracottaInvitation from '@/themes/mariage-terracotta-bloom/Invitation';
import rivieraDemo from '@/themes/mariage-riviera-postcard/demo.json';
import RivieraInvitation from '@/themes/mariage-riviera-postcard/Invitation';

/**
 * The short date, and the Date chapter of the three themes, follow the reading
 * order of the **invitation's** locale: day-month-year in French,
 * month-day-year in English. `12.06.27` is 12 June to a French guest and
 * 6 December to an American one, and the American market is the one the themes
 * are sold on (BRIEF §2).
 *
 * The order is decided once, in `shortDateParts()`, so the envelope, the
 * "save the date" piece and the three papers/tiles/arches of the Date chapter
 * can never disagree. These tests check the function *and* the markup the
 * three themes produce from it — the chapter is the place where a wrong order
 * is hardest to spot by eye, because nothing there is labelled in French.
 */

const THEMES = [
  { slug: 'mariage-noir-ivoire', Invitation: NoirInvitation, demo: noirDemo },
  { slug: 'mariage-terracotta-bloom', Invitation: TerracottaInvitation, demo: terracottaDemo },
  { slug: 'mariage-riviera-postcard', Invitation: RivieraInvitation, demo: rivieraDemo },
] as const;

/** The `<b>` values of the Date chapter, in document order. */
function dateChapterNumbers(html: string): string[] {
  const start = html.indexOf('data-chapter="date"');
  expect(start).toBeGreaterThan(-1);
  const end = html.indexOf('<section', start);
  const chapter = html.slice(start, end === -1 ? undefined : end);
  return [...chapter.matchAll(/<b>(\d{2})<\/b>/g)].map((match) => match[1] ?? '');
}

describe('shortDateParts', () => {
  const base = InvitationContent.parse(rivieraDemo);

  it('reads month-day-year in English', () => {
    const content = { ...base, locale: 'en' as const };
    expect(shortDateParts(content)).toEqual(['06', '19', '27']);
    expect(shortDate(content)).toBe('06.19.27');
  });

  it('reads day-month-year in French', () => {
    const content = { ...base, locale: 'fr' as const };
    expect(shortDateParts(content)).toEqual(['19', '06', '27']);
    expect(shortDate(content)).toBe('19.06.27');
  });

  it('keeps the year last in both locales', () => {
    for (const locale of ['en', 'fr'] as const) {
      expect(shortDateParts({ ...base, locale })[2]).toBe('27');
    }
  });

  it('honours a custom separator', () => {
    expect(shortDate({ ...base, locale: 'fr' as const }, ' · ')).toBe('19 · 06 · 27');
  });
});

describe.each(THEMES)('$slug — Date chapter', ({ Invitation, demo }) => {
  const base = InvitationContent.parse(demo);

  function render(locale: 'en' | 'fr'): string {
    return renderToStaticMarkup(
      createElement(Invitation, { content: { ...base, locale }, mode: 'demo' as const }),
    );
  }

  it('writes the three numbers in the order of the locale', () => {
    for (const locale of ['en', 'fr'] as const) {
      const expected = shortDateParts({ ...base, locale });
      expect(dateChapterNumbers(render(locale)).slice(0, 3)).toEqual(expected);
    }
  });

  it('puts the day before the month in French and after it in English', () => {
    const [day, month] = [base.event.date.slice(8, 10), base.event.date.slice(5, 7)];
    const fr = dateChapterNumbers(render('fr'));
    const en = dateChapterNumbers(render('en'));
    expect(fr.indexOf(day)).toBeLessThan(fr.indexOf(month));
    expect(en.indexOf(month)).toBeLessThan(en.indexOf(day));
  });
});
