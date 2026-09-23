import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalDocument, type LegalSection } from '../LegalDocument';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal');
  return { title: t('terms.title') };
}

/** `/legal/terms` — terms of sale. */
export default async function LegalTermsPage() {
  const t = await getTranslations('legal');
  const sections = t.raw('terms.sections') as LegalSection[];
  return <LegalDocument title={t('terms.title')} sections={sections} />;
}
