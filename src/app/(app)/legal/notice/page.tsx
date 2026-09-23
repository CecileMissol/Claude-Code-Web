import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalDocument, type LegalSection } from '../LegalDocument';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal');
  return { title: t('notice.title') };
}

/** `/legal/notice` — legal notice (publisher, hosting, IP, governing law). */
export default async function LegalNoticePage() {
  const t = await getTranslations('legal');
  const sections = t.raw('notice.sections') as LegalSection[];
  return <LegalDocument title={t('notice.title')} sections={sections} />;
}
