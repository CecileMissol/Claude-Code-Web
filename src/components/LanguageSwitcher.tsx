import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { LOCALES, LOCALE_LABELS } from '@/i18n/config';
import { switchLocaleAction } from '@/i18n/locale';

/**
 * Cookie-based language switcher.
 * Progressive enhancement: it is a plain form, so it works without JavaScript.
 */
export async function LanguageSwitcher() {
  const current = await getLocale();
  const t = await getTranslations('common');

  return (
    <form
      action={switchLocaleAction}
      className="flex items-center gap-1"
      aria-label={t('languageSwitcher')}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="submit"
          name="locale"
          value={locale}
          aria-current={locale === current ? 'true' : undefined}
          className={
            locale === current
              ? 'rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-stone-50 dark:bg-stone-100 dark:text-stone-900'
              : 'rounded-full px-3 py-1 text-xs text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800'
          }
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </form>
  );
}
