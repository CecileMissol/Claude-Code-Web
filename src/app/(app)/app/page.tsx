import Link from 'next/link';
import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { SignOutButton } from '@/components/SignOutButton';
import { getDb } from '@/db';
import { listInvitationsByOwner } from '@/db/queries';
import { requireUser } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return { title: t('title') };
}

/** `/app` — the couple's dashboard: their invitations, and a way out. */
export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getTranslations('dashboard');
  const auth = await getTranslations('auth');
  const format = await getFormatter();

  const invitations = await listInvitationsByOwner(getDb(), user.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {auth('signedInAs', { email: user.email })}
          </p>
        </div>
        <SignOutButton label={auth('signOut')} />
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 p-6 dark:border-stone-700">
          <p>{t('empty')}</p>
          <p className="mt-2 text-sm text-stone-500">
            <Link href="/activate" className="underline">
              {t('emptyCta')}
            </Link>
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="flex-1">
                <p className="font-medium">{invitation.slug ?? invitation.id}</p>
                <p className="text-sm text-stone-500">
                  {t(`status.${invitation.status}`)} ·{' '}
                  {t('createdAt', {
                    date: format.dateTime(invitation.createdAt, { dateStyle: 'medium' }),
                  })}
                </p>
              </div>
              <Link href={`/app/${invitation.id}/edit`} className="text-sm underline">
                {t('actions.edit')}
              </Link>
              <Link href={`/app/${invitation.id}/responses`} className="text-sm underline">
                {t('actions.responses')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
