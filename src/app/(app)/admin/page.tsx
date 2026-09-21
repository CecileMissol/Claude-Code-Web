import Link from 'next/link';
import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { getDb } from '@/db';
import { ensureThemesSeeded } from '@/db/seed-themes';
import { listAuditLog, listInvitationsForAdmin, listPendingActivations } from '@/db/queries';
import { requireAdmin } from '@/lib/auth';
import {
  approveActivationAction,
  extendInvitationAction,
  rejectActivationAction,
  toggleInvitationAction,
} from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');
  return { title: t('title') };
}

const TABS = ['activations', 'invitations', 'audit'] as const;
type Tab = (typeof TABS)[number];

function resolveTab(value: string | string[] | undefined): Tab {
  const candidate = Array.isArray(value) ? value[0] : value;
  return (TABS as readonly string[]).includes(candidate ?? '') ? (candidate as Tab) : 'activations';
}

/**
 * `/admin` — back office restricted to `ADMIN_EMAILS`: activation review,
 * the invitations list, and the audit log. Everything here uses plain HTML
 * forms bound to Server Actions, so it works without client JavaScript.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  await requireAdmin();
  const t = await getTranslations('admin');
  const format = await getFormatter();
  const db = getDb();
  await ensureThemesSeeded(db);

  const { tab: rawTab } = await searchParams;
  const tab = resolveTab(rawTab);

  async function renderActivations() {
    const pending = await listPendingActivations(db);

    if (pending.length === 0) {
      return <p className="text-sm text-stone-500">{t('activations.empty')}</p>;
    }

    return (
      <ul className="divide-y divide-stone-200 dark:divide-stone-800">
        {pending.map(({ activation, themeName }) => (
          <li key={activation.id} className="space-y-3 py-4">
            <div>
              <p className="font-medium">
                #{activation.etsyOrderId} · {activation.email}
              </p>
              <p className="text-sm text-stone-500">
                {themeName} ·{' '}
                {format.dateTime(activation.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <form action={approveActivationAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={activation.id} />
                <select
                  name="locale"
                  defaultValue="en"
                  aria-label={t('activations.localeLabel')}
                  className="rounded-md border border-stone-300 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900"
                >
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                </select>
                <button
                  type="submit"
                  className="rounded-full bg-stone-900 px-4 py-1.5 text-sm text-stone-50 dark:bg-stone-100 dark:text-stone-900"
                >
                  {t('activations.approve')}
                </button>
              </form>

              <form action={rejectActivationAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={activation.id} />
                <input
                  type="text"
                  name="reason"
                  placeholder={t('activations.reasonPlaceholder')}
                  className="rounded-md border border-stone-300 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900"
                />
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 px-4 py-1.5 text-sm dark:border-stone-700"
                >
                  {t('activations.reject')}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  async function renderInvitations() {
    const rows = await listInvitationsForAdmin(db);

    if (rows.length === 0) {
      return <p className="text-sm text-stone-500">{t('invitationsTab.empty')}</p>;
    }

    return (
      <ul className="divide-y divide-stone-200 dark:divide-stone-800">
        {rows.map(({ invitation, ownerEmail, themeSlug }) => (
          <li key={invitation.id} className="flex flex-wrap items-center gap-3 py-4">
            <div className="flex-1">
              <p className="font-medium">{invitation.slug ?? invitation.id}</p>
              <p className="text-sm text-stone-500">
                {ownerEmail} · {themeSlug} · {t(`invitationsTab.status.${invitation.status}`)}
              </p>
              <p className="text-xs text-stone-400">
                {invitation.publishedAt
                  ? t('invitationsTab.publishedAt', {
                      date: format.dateTime(invitation.publishedAt, { dateStyle: 'medium' }),
                    })
                  : t('invitationsTab.notPublished')}
                {invitation.expiresAt && (
                  <>
                    {' · '}
                    {t('invitationsTab.expiresAt', {
                      date: format.dateTime(invitation.expiresAt, { dateStyle: 'medium' }),
                    })}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={extendInvitationAction}>
                <input type="hidden" name="id" value={invitation.id} />
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs dark:border-stone-700"
                >
                  {t('invitationsTab.extend')}
                </button>
              </form>
              <form action={toggleInvitationAction}>
                <input type="hidden" name="id" value={invitation.id} />
                <input type="hidden" name="enabled" value={String(invitation.status === 'disabled')} />
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs dark:border-stone-700"
                >
                  {invitation.status === 'disabled' ? t('invitationsTab.enable') : t('invitationsTab.disable')}
                </button>
              </form>
              {invitation.slug && invitation.status === 'published' && (
                <Link href={`/${invitation.slug}`} target="_blank" className="text-xs underline">
                  {t('invitationsTab.open')}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  async function renderAudit() {
    const entries = await listAuditLog(db, 100);

    if (entries.length === 0) {
      return <p className="text-sm text-stone-500">{t('auditTab.empty')}</p>;
    }

    return (
      <ul className="divide-y divide-stone-200 text-sm dark:divide-stone-800">
        {entries.map((entry) => (
          <li key={entry.id} className="py-3">
            <p>
              <span className="font-medium">{entry.action}</span>
              {entry.actorEmail && <span className="text-stone-500"> · {entry.actorEmail}</span>}
            </p>
            <p className="text-xs text-stone-500">
              {format.dateTime(entry.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
              {entry.targetType && ` · ${entry.targetType}:${entry.targetId}`}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">{t('intro')}</p>
      </div>

      <nav className="flex gap-4 border-b border-stone-200 text-sm dark:border-stone-800">
        {TABS.map((id) => (
          <Link
            key={id}
            href={`/admin?tab=${id}`}
            className={`-mb-px border-b-2 px-1 pb-2 ${
              tab === id
                ? 'border-stone-900 font-medium dark:border-stone-100'
                : 'border-transparent text-stone-500'
            }`}
          >
            {t(`sections.${id}`)}
          </Link>
        ))}
      </nav>

      {tab === 'activations' && (await renderActivations())}
      {tab === 'invitations' && (await renderInvitations())}
      {tab === 'audit' && (await renderAudit())}
    </section>
  );
}
