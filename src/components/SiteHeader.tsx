import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getSession } from '@/lib/auth';

/** Application header: brand, primary links and the language switcher. */
export async function SiteHeader() {
  const t = await getTranslations('common');
  const sessionUser = await safeSession();

  return (
    <header className="border-b border-stone-200 dark:border-stone-800">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4">
        <Link href="/" className="font-medium">
          {t('appName')}
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-x-4 text-sm text-stone-600 dark:text-stone-400">
          <Link href="/demo/mariage-noir-ivoire">Demo</Link>
          {sessionUser ? (
            <Link href="/app">{t('nav.dashboard')}</Link>
          ) : (
            <Link href="/login">{t('nav.login')}</Link>
          )}
          {sessionUser?.isAdmin && <Link href="/admin">{t('nav.admin')}</Link>}
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
