import { getTranslations } from 'next-intl/server';
import { Stub } from '@/components/Stub';

/** `/activate` — Etsy order activation. Filled in during phase 7. */
export default async function ActivatePage() {
  const t = await getTranslations('auth');
  return <Stub title={t('activate.title')} intro={t('activate.intro')} />;
}
