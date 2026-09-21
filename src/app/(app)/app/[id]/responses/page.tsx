import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Stub } from '@/components/Stub';
import { getDb } from '@/db';
import { getInvitationForOwner } from '@/db/queries';
import { requireUser } from '@/lib/auth';

/** `/app/[id]/responses` — RSVP dashboard (phase 6). */
export default async function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getTranslations('dashboard');

  const invitation = await getInvitationForOwner(getDb(), id, user.id);
  if (!invitation) notFound();

  return <Stub title={t('responses.title')} intro={t('responses.intro')} />;
}
