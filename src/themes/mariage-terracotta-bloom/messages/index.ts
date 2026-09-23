import type { Locale } from '@/i18n/config';
import en from './en.json';
import fr from './fr.json';

/**
 * Interface copy of the "Terracotta Bloom" theme.
 *
 * The invitation never reads the `locale` cookie: its language is the one the
 * couple chose (`content.locale`), because a wedding invitation is written in
 * one language for every guest. `en.json` is the reference shape; a unit test
 * asserts both files carry the same keys.
 */

export type Messages = typeof en;

const BY_LOCALE: Record<Locale, Messages> = { en, fr: fr as Messages };

/** Copy for an invitation locale, falling back to English. */
export function messagesFor(locale: string): Messages {
  return BY_LOCALE[locale as Locale] ?? en;
}

export { en, fr };
export default BY_LOCALE;
