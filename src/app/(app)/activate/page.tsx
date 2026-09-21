import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getDb } from '@/db';
import { ensureThemesSeeded } from '@/db/seed';
import { loadAllManifests } from '@/themes/manifests';
import type { Locale } from '@/i18n/config';
import { ActivationForm } from './ActivationForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('activate.title') };
}

/**
 * `/activate` — Etsy order activation (phase 7, V0: manual review in
 * `/admin`). The theme list is seeded once here so the select always has real
 * database ids to submit, even on a brand-new environment.
 */
export default async function ActivatePage() {
  const t = await getTranslations('auth');
  const locale = (await getLocale()) as Locale;

  const db = getDb();
  await ensureThemesSeeded(db);
  const manifests = await loadAllManifests();
  const themes = manifests.map((manifest) => ({
    slug: manifest.slug,
    name: manifest.name[locale] ?? manifest.name.en,
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('activate.title')}</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">{t('activate.intro')}</p>
      </div>
      <ActivationForm themes={themes} />
    </section>
  );
}
