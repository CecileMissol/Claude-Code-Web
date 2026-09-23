import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalDocument, type LegalSection } from '../LegalDocument';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal');
  return { title: t('privacy.title') };
}

/** `/legal/privacy` — GDPR privacy policy. */
export default async function LegalPrivacyPage() {
  const t = await getTranslations('legal');
  const sections = t.raw('privacy.sections') as LegalSection[];
  return <LegalDocument title={t('privacy.title')} sections={sections} />;
}
