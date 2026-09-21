import type { MetadataRoute } from 'next';
import { appOrigin } from '@/lib/publish';
import { THEME_SLUGS } from '@/themes/manifests';

/**
 * `/robots.txt`.
 *
 * Only the pages that are meant to be found are crawlable: the marketing home,
 * the three theme demos and the legal pages. Everything that belongs to a
 * buyer — the dashboard, the admin desk, the activation form, the magic-link
 * page — and the whole API are kept out of the index. Published invitations
 * (`/<slug>`) are deliberately *not* listed in the sitemap, but they are not
 * disallowed either: a couple may share its link publicly, and each one sets
 * its own `robots` metadata.
 *
 * Note that the demos also carry `robots: { index: false }` in their own page
 * metadata (`src/app/demo/demoPage.tsx`): crawling them is welcome, indexing a
 * fictional wedding is not. `Allow` here only says the crawler may fetch them.
 *
 * Rendered per request, not at build time: `APP_URL` is a Worker `var`, unknown
 * when the bundle is built (the CI builds with the default
 * `http://localhost:3000`). Prerendering this file statically would freeze that
 * placeholder origin into the deployed `robots.txt`.
 */
export const dynamic = 'force-dynamic';
export default function robots(): MetadataRoute.Robots {
  const origin = appOrigin();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', ...THEME_SLUGS.map((slug) => `/demo/${slug}`), '/legal/'],
        disallow: ['/app', '/admin', '/api', '/activate', '/login'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
