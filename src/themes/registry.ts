import type { Locale } from '@/i18n/config';
import type { ThemeModule } from './types';

/**
 * Theme registry: slug → lazily imported theme module.
 * Nothing of a theme (component, CSS, assets) is bundled until it is requested.
 */

export const THEME_SLUGS = ['mariage-noir-ivoire'] as const;

export type ThemeSlug = (typeof THEME_SLUGS)[number];

export function isThemeSlug(value: unknown): value is ThemeSlug {
  return typeof value === 'string' && (THEME_SLUGS as readonly string[]).includes(value);
}

const LOADERS: Record<ThemeSlug, () => Promise<ThemeModule>> = {
  'mariage-noir-ivoire': () => import('./mariage-noir-ivoire'),
};

const MESSAGE_LOADERS: Record<ThemeSlug, Record<Locale, () => Promise<Record<string, unknown>>>> = {
  'mariage-noir-ivoire': {
    en: async () => (await import('./mariage-noir-ivoire/messages/en.json')).default,
    fr: async () => (await import('./mariage-noir-ivoire/messages/fr.json')).default,
  },
};

/** Loads a theme module, or returns `null` when the slug is unknown. */
export async function loadTheme(slug: string): Promise<ThemeModule | null> {
  if (!isThemeSlug(slug)) return null;
  return LOADERS[slug]();
}

/** Same, but throws — convenient when the slug has already been validated. */
export async function requireTheme(slug: string): Promise<ThemeModule> {
  const theme = await loadTheme(slug);
  if (!theme) throw new Error(`Unknown theme: ${slug}`);
  return theme;
}

/**
 * Loads the interface copy of an invitation theme (not the application i18n).
 * The invitation reads its locale from its own content, never from the cookie.
 */
export async function loadThemeMessages(
  slug: string,
  locale: Locale,
): Promise<Record<string, unknown>> {
  if (!isThemeSlug(slug)) throw new Error(`Unknown theme: ${slug}`);
  return MESSAGE_LOADERS[slug][locale]();
}

/** Manifests of every registered theme, for the admin and the editor. */
export async function loadAllManifests() {
  const themes = await Promise.all(THEME_SLUGS.map((slug) => LOADERS[slug]()));
  return themes.map((theme) => theme.manifest);
}
