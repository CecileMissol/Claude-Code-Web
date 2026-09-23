import type { ThemeManifest } from './types';

/**
 * Slugs and **manifests only** — the half of the registry that carries no
 * client component in its import graph.
 *
 * Why this module exists, and why it must not import `./<slug>/index`:
 * a theme's entry point re-exports its `'use client'` tree. Any page whose
 * module graph can reach it — even behind a dynamic `import()` that is never
 * called — gets that theme's client chunk added to its client reference
 * manifest, and Next then emits a `<script>` for it in the document. Before
 * this split, listing the themes on `/` shipped all three animated
 * invitations (≈ 36 kB gzip) to every visitor of the marketing page.
 *
 * Pages that only need to *describe* the themes (marketing home, `/app`,
 * `/activate`, `/admin`, the D1 seed) import from here.
 * Pages that need to *render* one import `./registry`.
 */

export const THEME_SLUGS = [
  'mariage-noir-ivoire',
  'mariage-terracotta-bloom',
  'mariage-riviera-postcard',
] as const;

export type ThemeSlug = (typeof THEME_SLUGS)[number];

export function isThemeSlug(value: unknown): value is ThemeSlug {
  return typeof value === 'string' && (THEME_SLUGS as readonly string[]).includes(value);
}

const MANIFEST_LOADERS: Record<ThemeSlug, () => Promise<ThemeManifest>> = {
  'mariage-noir-ivoire': async () => (await import('./mariage-noir-ivoire/manifest')).manifest,
  'mariage-terracotta-bloom': async () =>
    (await import('./mariage-terracotta-bloom/manifest')).manifest,
  'mariage-riviera-postcard': async () =>
    (await import('./mariage-riviera-postcard/manifest')).manifest,
};

/** Manifest of one theme, without loading its component tree. */
export async function loadThemeManifest(slug: string): Promise<ThemeManifest | null> {
  if (!isThemeSlug(slug)) return null;
  return MANIFEST_LOADERS[slug]();
}

/** Manifests of every registered theme, in registry order. */
export async function loadAllManifests(): Promise<ThemeManifest[]> {
  return Promise.all(THEME_SLUGS.map((slug) => MANIFEST_LOADERS[slug]()));
}
