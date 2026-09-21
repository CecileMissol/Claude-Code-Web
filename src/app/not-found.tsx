import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** Shared 404 page. */
export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('errors.notFound')}</h1>
      <p className="text-stone-600 dark:text-stone-400">{t('errors.notFoundBody')}</p>
      <Link href="/" className="text-sm underline">
        {t('backHome')}
      </Link>
    </section>
  );
}
