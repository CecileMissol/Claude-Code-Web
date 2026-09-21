import { describe, expect, it } from 'vitest';
import en from '@/themes/mariage-riviera-postcard/messages/en.json';
import fr from '@/themes/mariage-riviera-postcard/messages/fr.json';
import { messagesFor } from '@/themes/mariage-riviera-postcard/messages';

/**
 * The invitation's own copy, which is not the application i18n: it is read from
 * `content.locale`, because a wedding invitation is written in one language for
 * every guest. `en.json` is the reference shape.
 */

/** Every leaf path of a nested object, as `a.b.c`. */
function paths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('theme messages', () => {
  it('carries the same keys in both languages', () => {
    expect(paths(fr).sort()).toEqual(paths(en).sort());
  });

  it('leaves no key empty', () => {
    for (const file of [en, fr]) {
      for (const path of paths(file)) {
        const value = path
          .split('.')
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], file);
        expect(typeof value, path).toBe('string');
        expect(String(value).trim().length, path).toBeGreaterThan(0);
      }
    }
  });

  it('carries the copy this theme adds to the shared set', () => {
    expect(en.intro.airmail).toBeTruthy();
    expect(en.intro.stampCountry).toBeTruthy();
    expect(en.program.menuKicker).toBeTruthy();
    expect([en.date.day, en.date.month, en.date.year].every(Boolean)).toBe(true);
  });

  it('resolves a locale and falls back to English for an unknown one', () => {
    expect(messagesFor('fr')).toBe(fr);
    expect(messagesFor('en')).toBe(en);
    expect(messagesFor('de')).toBe(en);
  });
});
