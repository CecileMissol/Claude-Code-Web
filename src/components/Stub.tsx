import { getTranslations } from 'next-intl/server';

/**
 * Clean placeholder for a route whose content belongs to a later phase.
 * Renders a translated title and a "coming soon" paragraph.
 */
export async function Stub({ title, intro }: { title: string; intro?: string }) {
  const t = await getTranslations('common');

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {intro && <p className="text-stone-600 dark:text-stone-400">{intro}</p>}
      <p className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700">
        <strong>{t('comingSoon')}</strong> {t('comingSoonBody')}
      </p>
    </section>
  );
}
