import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { brand } from '@/brand';

/** Application footer: brand mark + copyright and the legal pages, on every app-shell page. */
export async function SiteFooter() {
  const t = await getTranslations('common');
  const { Logo } = brand;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-muted/30 bg-brand-bg text-brand-fg">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-brand-fg/70">
        <div className="flex items-center gap-2">
          <Logo variant="mark" size={20} />
          <p>
            © {year} {brand.name}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/legal/notice" className="underline-offset-2 hover:underline">
            {t('nav.legalNotice')}
          </Link>
          <Link href="/legal/privacy" className="underline-offset-2 hover:underline">
            {t('nav.legalPrivacy')}
          </Link>
          <Link href="/legal/terms" className="underline-offset-2 hover:underline">
            {t('nav.legalTerms')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
