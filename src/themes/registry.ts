import type { Locale } from '@/i18n/config';
import type { ThemeModule } from './types';
import { isThemeSlug } from './manifests';
import type { ThemeSlug } from './manifests';

/**
 * Theme registry: slug → lazily imported theme module.
 * Nothing of a theme (component, CSS, assets) is bundled until it is requested.
 *
 * **Importing this module pulls the three themes' client trees into the
 * importing page's chunk list** (see the note at the top of `./manifests.ts`).
 * Only the routes that actually render an invitation may import it; everything
 * that merely lists the themes imports `./manifests` instead.
 */

export { THEME_SLUGS, isThemeSlug, loadAllManifests, loadThemeManifest } from './manifests';
export type { ThemeSlug } from './manifests';

const LOADERS: Record<ThemeSlug, () => Promise<ThemeModule>> = {
  'mariage-noir-ivoire': () => import('./mariage-noir-ivoire'),
  'mariage-terracotta-bloom': () => import('./mariage-terracotta-bloom'),
  'mariage-riviera-postcard': () => import('./mariage-riviera-postcard'),
};

const MESSAGE_LOADERS: Record<ThemeSlug, Record<Locale, () => Promise<Record<string, unknown>>>> = {
  'mariage-noir-ivoire': {
    en: async () => (await import('./mariage-noir-ivoire/messages/en.json')).default,
    fr: async () => (await import('./mariage-noir-ivoire/messages/fr.json')).default,
  },
  'mariage-terracotta-bloom': {
    en: async () => (await import('./mariage-terracotta-bloom/messages/en.json')).default,
    fr: async () => (await import('./mariage-terracotta-bloom/messages/fr.json')).default,
  },
  'mariage-riviera-postcard': {
    en: async () => (await import('./mariage-riviera-postcard/messages/en.json')).default,
    fr: async () => (await import('./mariage-riviera-postcard/messages/fr.json')).default,
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
