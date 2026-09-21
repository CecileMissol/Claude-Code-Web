import { getTranslations } from 'next-intl/server';
import { Stub } from '@/components/Stub';
import { requireAdmin } from '@/lib/auth';

/** `/admin` — back office, restricted to the emails listed in ADMIN_EMAILS. */
export default async function AdminPage() {
  await requireAdmin();
  const t = await getTranslations('admin');
  return <Stub title={t('title')} intro={t('intro')} />;
}
