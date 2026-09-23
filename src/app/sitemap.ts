import type { MetadataRoute } from 'next';
import { appOrigin } from '@/lib/publish';
import { THEME_SLUGS } from '@/themes/manifests';

/**
 * `/sitemap.xml` — the seven public pages of the shop window: the home page,
 * the three theme demos and the three legal pages.
 *
 * Published invitations are not listed: they belong to the couples, their
 * slugs change until the day they are shared, and they expire with the hosting
 * window. `THEME_SLUGS` comes from `@/themes/manifests`, the half of the
 * registry that carries no client component, so building the sitemap never
 * pulls an invitation's chunk into the graph.
 *
 * Rendered per request for the same reason as `robots.ts`: `APP_URL` is a
 * Worker `var`, unknown at build time.
 */
export const dynamic = 'force-dynamic';
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = appOrigin();
  const lastModified = new Date();

  return [
    { url: `${origin}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
    ...THEME_SLUGS.map((slug) => ({
      url: `${origin}/demo/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...['notice', 'privacy', 'terms'].map((page) => ({
      url: `${origin}/legal/${page}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ];
}
