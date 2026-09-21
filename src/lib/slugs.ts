/**
 * Public invitation slugs.
 *
 * Invitations are served from the root (`/zoe-et-dylan`), so a slug must never
 * collide with an application route or a well-known file.
 */

/** Slugs the application keeps for itself. Keep in sync with `src/app/`. */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // application routes
  'app',
  'admin',
  'activate',
  'activer',
  'demo',
  'api',
  'login',
  'logout',
  'signin',
  'signup',
  'legal',
  'privacy',
  'terms',
  'notice',
  'mentions',
  'confidentialite',
  'cgv',
  'account',
  'settings',
  'support',
  'help',
  'contact',
  'pricing',
  'blog',
  // locales
  'fr',
  'en',
  // static and well-known files
  'assets',
  'static',
  'public',
  '_next',
  '_vercel',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'apple-touch-icon.png',
  '.well-known',
]);

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 60;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Turns arbitrary text into a URL-safe slug: accents removed, lower-cased,
 * anything that is not `[a-z0-9]` collapsed into a single dash.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\u2018\u2019\u02BC'`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
}

/** True when the slug is well-formed, long enough and not reserved. */
export function isSlugAvailableShape(slug: string): boolean {
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) return false;
  if (!SLUG_RE.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  // A slug that looks like a file would shadow a static asset.
  if (slug.includes('.')) return false;
  return true;
}

/** True when the slug is reserved by the application. */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/**
 * Suggests a public slug for a couple: `zoe-et-dylan` in French,
 * `zoe-and-dylan` in English. Falls back gracefully on empty first names.
 */
export function suggestSlug(
  firstName1: string,
  firstName2: string,
  locale: 'en' | 'fr' = 'fr',
): string {
  const a = slugify(firstName1);
  const b = slugify(firstName2);
  const joiner = locale === 'fr' ? 'et' : 'and';

  const base = [a, b].filter(Boolean).join(`-${joiner}-`);
  if (!base) return '';

  const slug = base.slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, '');
  return isReservedSlug(slug) ? `${slug}-${joiner}` : slug;
}

/**
 * Appends a numeric suffix until the candidate is free.
 * `taken` reports whether a slug already exists in the database.
 */
export async function nextFreeSlug(
  base: string,
  taken: (slug: string) => Promise<boolean>,
  maxAttempts = 50,
): Promise<string> {
  if (isSlugAvailableShape(base) && !(await taken(base))) return base;

  for (let i = 2; i <= maxAttempts; i += 1) {
    const candidate = `${base}-${i}`.slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, '');
    if (isSlugAvailableShape(candidate) && !(await taken(candidate))) return candidate;
  }

  throw new Error(`Could not find a free slug based on "${base}".`);
}
