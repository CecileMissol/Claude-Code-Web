import { beforeEach, describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { resetEnvCache } from '@/lib/env';
import { THEME_SLUGS } from '@/themes/manifests';

/**
 * `/robots.txt` and `/sitemap.xml`.
 *
 * Both are built from `APP_URL` (the single source of the public origin, read
 * through `appOrigin()`) and from the theme registry, so a fourth theme gets
 * crawled and listed the day it is registered, without touching these files.
 *
 * What must never regress: the buyer's area, the admin desk, the activation
 * form, the magic-link page and the whole API stay out of the index — an
 * indexed `/activate` or `/login` is an invitation to credential-stuffing, and
 * an indexed `/app/<id>/responses` would expose guests' answers.
 */

const ORIGIN = 'https://invitations.example';

beforeEach(() => {
  // `wrangler types` narrows process.env to literal types, hence the cast.
  const env = process.env as unknown as Record<string, string>;
  env.APP_URL = `${ORIGIN}/`;
  env.BETTER_AUTH_SECRET = 'test-secret-at-least-16-chars';
  resetEnvCache();
});

describe('robots.txt', () => {
  it('allows the shop window and the three demos', () => {
    const rule = robots().rules;
    const { allow } = Array.isArray(rule) ? rule[0]! : rule;
    expect(allow).toContain('/');
    expect(allow).toContain('/legal/');
    for (const slug of THEME_SLUGS) expect(allow).toContain(`/demo/${slug}`);
  });

  it('keeps the private areas and the API out', () => {
    const rule = robots().rules;
    const { disallow } = Array.isArray(rule) ? rule[0]! : rule;
    expect(disallow).toEqual(['/app', '/admin', '/api', '/activate', '/login']);
  });

  it('points at the sitemap on the configured origin, without a double slash', () => {
    expect(robots().sitemap).toBe(`${ORIGIN}/sitemap.xml`);
    expect(robots().host).toBe(ORIGIN);
  });
});

describe('sitemap.xml', () => {
  it('lists the home page, the three demos and the three legal pages', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      `${ORIGIN}/`,
      ...THEME_SLUGS.map((slug) => `${ORIGIN}/demo/${slug}`),
      `${ORIGIN}/legal/notice`,
      `${ORIGIN}/legal/privacy`,
      `${ORIGIN}/legal/terms`,
    ]);
  });

  it('never leaks a published invitation or a private page', () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const path of ['/app', '/admin', '/activate', '/login', '/api']) {
      expect(urls.some((url) => url.includes(path))).toBe(false);
    }
  });

  it('dates every entry', () => {
    for (const entry of sitemap()) expect(entry.lastModified).toBeInstanceOf(Date);
  });
});
