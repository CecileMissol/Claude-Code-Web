import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** Marketing home page. Placeholder: the real showcase lands in a later phase. */
export default async function HomePage() {
  const t = await getTranslations('marketing');
  const common = await getTranslations('common');

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('hero.title')}</h1>
      <p className="text-lg text-stone-600 dark:text-stone-400">{t('hero.subtitle')}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/demo/mariage-noir-ivoire"
          className="rounded-full bg-stone-900 px-5 py-2 text-sm text-stone-50 dark:bg-stone-100 dark:text-stone-900"
        >
          {t('hero.ctaDemo')}
        </Link>
        <Link
          href="/activate"
          className="rounded-full border border-stone-300 px-5 py-2 text-sm dark:border-stone-700"
        >
          {t('hero.ctaActivate')}
        </Link>
      </div>
      <p className="text-sm text-stone-500">{common('comingSoonBody')}</p>
    </section>
  );
}
