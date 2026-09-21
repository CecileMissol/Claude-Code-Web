import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { brand, brandStyleVars } from '@/brand';

/**
 * Shared 404 page. It renders directly under the root layout (it can be
 * reached from `/demo/<slug>` or `/[slug]` too, which have no layout of
 * their own), so it carries its own `.brand-shell` wrapper instead of
 * relying on `src/app/(app)/layout.tsx`.
 */
export default async function NotFound() {
  const t = await getTranslations('common');
  const m = await getTranslations('marketing');
  const { Logo } = brand;

  return (
    <div
      className="brand-shell flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center"
      style={brandStyleVars(brand)}
    >
      <Logo variant="mark" size={48} />
      <h1
        className="mt-6 text-3xl font-semibold text-brand-fg"
        style={{ fontFamily: 'var(--brand-font-heading)' }}
      >
        {t('errors.notFound')}
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-brand-fg/70">{t('errors.notFoundBody')}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-accent px-5 py-2 text-sm text-brand-on-accent"
        >
          {t('backHome')}
        </Link>
        <Link
          href="/demo/mariage-noir-ivoire"
          className="rounded-full border border-brand-muted/40 px-5 py-2 text-sm text-brand-fg"
        >
          {m('hero.ctaDemo')}
        </Link>
      </div>
    </div>
  );
}
