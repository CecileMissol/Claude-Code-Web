import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Stub } from '@/components/Stub';
import { getDb } from '@/db';
import { getInvitationForOwner } from '@/db/queries';
import { requireUser } from '@/lib/auth';

/** `/app/[id]/edit` — step-by-step editor with live preview (phase 4). */
export default async function EditInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getTranslations('editor');

  const invitation = await getInvitationForOwner(getDb(), id, user.id);
  if (!invitation) notFound();

  return <Stub title={t('title')} intro={t('intro')} />;
}
