import { describe, expect, it } from 'vitest';
import { LOCALES, matchAcceptLanguage, isLocale, DEFAULT_LOCALE } from '@/i18n/config';
import en from '@/messages/en/common.json';
import fr from '@/messages/fr/common.json';

const NAMESPACES = [
  'common',
  'auth',
  'editor',
  'dashboard',
  'admin',
  'legal',
  'marketing',
] as const;

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}${key}.`));
  }
  return [prefix.slice(0, -1)];
}

describe('application messages', () => {
  it('exposes the same keys in every locale, namespace by namespace', async () => {
    for (const namespace of NAMESPACES) {
      const enFile = (await import(`@/messages/en/${namespace}.json`)) as { default: unknown };
      const frFile = (await import(`@/messages/fr/${namespace}.json`)) as { default: unknown };
      expect(flatten(frFile.default).sort(), namespace).toEqual(flatten(enFile.default).sort());
    }
  });

  it('never leaves a message empty', () => {
    for (const file of [en, fr]) {
      for (const value of Object.values(file)) {
        expect(value).toBeTruthy();
      }
    }
  });
});

describe('locale negotiation', () => {
  it('knows its locales', () => {
    expect(LOCALES).toEqual(['en', 'fr']);
    expect(DEFAULT_LOCALE).toBe('en');
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });

  it('picks the best supported language out of Accept-Language', () => {
    expect(matchAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr');
    expect(matchAcceptLanguage('de-DE,de;q=0.9,en-GB;q=0.7')).toBe('en');
    expect(matchAcceptLanguage('de,it')).toBeNull();
    expect(matchAcceptLanguage(null)).toBeNull();
    expect(matchAcceptLanguage('')).toBeNull();
  });

  it('honours quality weights', () => {
    expect(matchAcceptLanguage('en;q=0.2,fr;q=0.9')).toBe('fr');
  });
});
