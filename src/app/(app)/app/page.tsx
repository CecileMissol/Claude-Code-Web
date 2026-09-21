import Link from 'next/link';
import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { SignOutButton } from '@/components/SignOutButton';
import { safeMigrateContent } from '@/content/migrations';
import { getDb } from '@/db';
import { listInvitationsWithThemeByOwner } from '@/db/queries';
import { createDraftInvitationAction } from '@/editor/actions';
import { CreateInvitationButton } from '@/editor/CreateInvitationButton';
import { requireUser } from '@/lib/auth';
import { getLocale } from 'next-intl/server';
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config';
import { loadAllManifests } from '@/themes/registry';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return { title: t('title') };
}

/**
 * `/app` — the couple's dashboard.
 *
 * Lists the invitations of the signed-in user (names, theme, status, last
 * edit) and links to the editor, the sharing page and the replies. Until the
 * Etsy activation is live, it also offers a button that creates a draft on the
 * default theme.
 */
export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getTranslations('dashboard');
  const auth = await getTranslations('auth');
  const format = await getFormatter();
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const rows = await listInvitationsWithThemeByOwner(getDb(), user.id);
  const manifests = await loadAllManifests();
  const themeNames = new Map(manifests.map((manifest) => [manifest.slug, manifest.name]));

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

      {rows.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed border-stone-300 p-6 dark:border-stone-700">
          <p>{t('empty')}</p>
          <p className="text-sm text-stone-500">{t('createHint')}</p>
          <form action={createDraftInvitationAction}>
            <CreateInvitationButton />
          </form>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {rows.map(({ invitation, themeSlug }) => {
              const parsed = safeMigrateContent(safeJson(invitation.content));
              const names = parsed.success
                ? t('coupleNames', {
                    partner1: parsed.data.couple.partner1.firstName,
                    partner2: parsed.data.couple.partner2.firstName,
                  })
                : t('unreadable');
              const themeName = themeNames.get(themeSlug)?.[locale] ?? themeSlug;

              return (
                <li key={invitation.id} className="flex flex-wrap items-center gap-3 py-4">
                  <div className="min-w-48 flex-1">
                    <p className="font-medium">{parsed.success ? names : t('untitled')}</p>
                    <p className="text-sm text-stone-500">
                      {themeName} · {t(`status.${invitation.status}`)} ·{' '}
                      {t('updatedAt', {
                        date: format.dateTime(invitation.updatedAt, { dateStyle: 'medium' }),
                      })}
                    </p>
                  </div>
                  <Link href={`/app/${invitation.id}/edit`} className="text-sm underline">
                    {t('actions.edit')}
                  </Link>
                  <Link href={`/app/${invitation.id}/share`} className="text-sm underline">
                    {t('actions.share')}
                  </Link>
                  <Link href={`/app/${invitation.id}/responses`} className="text-sm underline">
                    {t('actions.responses')}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="space-y-2 rounded-lg border border-dashed border-stone-300 p-4 dark:border-stone-700">
            <p className="text-sm text-stone-500">{t('createHint')}</p>
            <form action={createDraftInvitationAction}>
              <CreateInvitationButton />
            </form>
          </div>
        </>
      )}
    </section>
  );
}

/** Stored content is always written validated; a corrupt row must not 500. */
function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
