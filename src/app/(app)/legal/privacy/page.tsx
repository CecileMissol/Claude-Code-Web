import { getTranslations } from 'next-intl/server';
import { Stub } from '@/components/Stub';

/** `/legal/privacy` — legal page, written in phase 8. */
export default async function LegalPage() {
  const t = await getTranslations('legal');
  return <Stub title={t('privacy.title')} />;
}
