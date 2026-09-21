import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './locale';
import type { Locale } from './config';

/**
 * Message namespaces, one JSON file per space in `src/messages/<locale>/`.
 * Theme-specific copy does NOT live here: it lives in
 * `src/themes/<slug>/messages/<locale>.json`.
 */
const NAMESPACES = [
  'common',
  'auth',
  'editor',
  'dashboard',
  'admin',
  'legal',
  'marketing',
  'share',
  'responses',
] as const;

type Messages = Record<string, unknown>;

/** Loads and merges every namespace file for a locale. */
export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => {
      const mod = (await import(`../messages/${locale}/${ns}.json`)) as { default: Messages };
      return [ns, mod.default] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: 'Europe/Paris',
  };
});
