import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getSession } from '@/lib/auth';
import { brand } from '@/brand';

/** Application header: brand mark + wordmark, primary links and the language switcher. */
export async function SiteHeader() {
  const t = await getTranslations('common');
  const m = await getTranslations('marketing');
  const sessionUser = await safeSession();
  const { Logo } = brand;

  return (
    <header className="border-b border-brand-muted/30 bg-brand-bg text-brand-fg">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4">
        <Link href="/" className="text-brand-fg no-underline" aria-label={brand.name}>
          <Logo variant="full" />
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-x-4 text-sm text-brand-fg/80">
          <Link href="/demo/mariage-noir-ivoire" className="hover:text-brand-accent">
            {m('nav.demos')}
          </Link>
          {sessionUser ? (
            <Link href="/app" className="hover:text-brand-accent">
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-brand-accent">
              {t('nav.login')}
            </Link>
          )}
          <Link href="/activate" className="hover:text-brand-accent">
            {t('nav.activate')}
          </Link>
          {sessionUser?.isAdmin && (
            <Link href="/admin" className="hover:text-brand-accent">
              {t('nav.admin')}
            </Link>
          )}
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

/**
 * The header renders on every page, including before the D1 binding exists
 * (for example a plain `next build` prerender), so a failing session lookup
 * must not break the layout.
 */
async function safeSession() {
  try {
    return await getSession();
  } catch {
    return null;
  }
}
