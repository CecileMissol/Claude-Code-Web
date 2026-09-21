import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** Application footer: brand and the legal pages, on every app-shell page. */
export async function SiteFooter() {
  const t = await getTranslations('common');

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-stone-500">
        <p>{t('appName')}</p>
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
