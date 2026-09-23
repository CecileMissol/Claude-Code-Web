import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { deleteRsvpAction, toggleNotifyAction } from './actions';
import { DeleteReplyButton } from './DeleteReplyButton';
import { migrateContent } from '@/content/migrations';
import { getDb } from '@/db';
import { getInvitationForOwner, listRsvpsForOwner, rsvpStatsForOwner } from '@/db/queries';
import { requireUser } from '@/lib/auth';
import { effectiveStatus, isDeadlinePassed } from '@/lib/publish';
import { RSVP_RETENTION_MONTHS } from '@/lib/retention';
import type { Rsvp } from '@/db/schema';

export const dynamic = 'force-dynamic';

/**
 * `/app/[id]/responses` — the RSVP dashboard.
 *
 * Search and sort live in the query string rather than in component state: the
 * page stays a server component, the result is linkable, and it works without
 * JavaScript. The reply volume of a wedding (a few hundred rows at most) makes
 * filtering in memory the simplest correct choice.
 *
 * There is no "awaiting a reply" counter: the product has no guest list, so the
 * number of people who have not answered is unknowable. Only what was actually
 * received is shown.
 */

const SORTS = ['recent', 'oldest', 'name', 'attending'] as const;
type Sort = (typeof SORTS)[number];

function isSort(value: unknown): value is Sort {
  return typeof value === 'string' && (SORTS as readonly string[]).includes(value);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('responses');
  return { title: t('title') };
}

function matches(reply: Rsvp, query: string): boolean {
  if (!query) return true;
  const haystack = [reply.name, reply.email, reply.diet, reply.message]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function sortReplies(replies: Rsvp[], sort: Sort): Rsvp[] {
  const sorted = [...replies];

  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'attending':
      return sorted.sort(
        (a, b) =>
          Number(b.attending) - Number(a.attending) ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
    default:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export default async function ResponsesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requireUser();

  const db = getDb();
  const invitation = await getInvitationForOwner(db, id, user.id);
  if (!invitation) notFound();

  const t = await getTranslations('responses');
  const share = await getTranslations('share');
  const dashboard = await getTranslations('dashboard');
  const format = await getFormatter();

  const content = migrateContent(JSON.parse(invitation.content));
  const status = effectiveStatus(invitation);

  const [stats, all] = await Promise.all([
    rsvpStatsForOwner(db, id, user.id),
    listRsvpsForOwner(db, id, user.id),
  ]);

  const search = (query.q ?? '').trim().toLowerCase();
  const sort: Sort = isSort(query.sort) ? query.sort : 'recent';
  const replies = sortReplies(
    all.filter((reply) => matches(reply, search)),
    sort,
  );

  const deadlinePassed = isDeadlinePassed(content.rsvp.deadline, content.event.timezone);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="flex flex-wrap gap-3 text-sm text-stone-500">
          <Link href="/app" className="underline">
            {dashboard('title')}
          </Link>
          <Link href={`/app/${id}/share`} className="underline">
            {share('title')}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-stone-600 dark:text-stone-400">{t('intro')}</p>
      </header>

      {status !== 'published' && (
        <p className="rounded-lg border border-dashed border-stone-300 p-3 text-sm text-stone-500 dark:border-stone-700">
          {t('notPublished')}
        </p>
      )}
      {!content.rsvp.enabled && (
        <p className="rounded-lg border border-dashed border-stone-300 p-3 text-sm text-stone-500 dark:border-stone-700">
          {t('rsvpDisabled')}
        </p>
      )}
      {content.rsvp.deadline && (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {t(deadlinePassed ? 'deadlinePassed' : 'deadline', {
            date: format.dateTime(new Date(`${content.rsvp.deadline}T00:00:00Z`), {
              dateStyle: 'long',
              timeZone: 'UTC',
            }),
          })}
        </p>
      )}

      {/* ---------------- Counters ---------------- */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Counter label={t('counters.yes')} value={stats.yes} />
        <Counter label={t('counters.no')} value={stats.no} />
        <Counter label={t('counters.people')} value={stats.people} />
        <Counter label={t('counters.replies')} value={stats.replies} />
      </dl>

      {/* ---------------- Notification ---------------- */}
      <section className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
        <h2 className="text-sm font-semibold">{t('notify.title')}</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {content.rsvp.notifyByEmail ? t('notify.on') : t('notify.off')}
        </p>
        <form action={toggleNotifyAction} className="mt-3">
          <input type="hidden" name="invitationId" value={id} />
          <input
            type="hidden"
            name="enabled"
            value={content.rsvp.notifyByEmail ? 'false' : 'true'}
          />
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            {content.rsvp.notifyByEmail ? t('notify.disable') : t('notify.enable')}
          </button>
        </form>
      </section>

      {/* ---------------- Search, sort, export ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-stone-600 dark:text-stone-400">{t('search.label')}</span>
            <input
              type="search"
              name="q"
              defaultValue={query.q ?? ''}
              placeholder={t('search.placeholder')}
              className="mt-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
            />
          </label>

          <label className="text-sm">
            <span className="block text-stone-600 dark:text-stone-400">{t('sort.label')}</span>
            <select
              name="sort"
              defaultValue={sort}
              className="mt-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              {SORTS.map((option) => (
                <option key={option} value={option}>
                  {t(`sort.${option}`)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            {t('search.submit')}
          </button>
          {search && (
            <Link href={`/app/${id}/responses`} className="text-sm underline">
              {t('search.clear')}
            </Link>
          )}
        </form>

        <div className="text-sm">
          <a href={`/api/rsvps/${id}/export.csv`} className="underline">
            {t('export.csv')}
          </a>
          <p className="text-xs text-stone-500">{t('export.help')}</p>
        </div>
      </div>

      {search && (
        <p className="text-sm text-stone-500">
          {t('search.results', { count: replies.length, total: all.length })}
        </p>
      )}

      {/* ---------------- Table ---------------- */}
      {replies.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-6 text-sm text-stone-500 dark:border-stone-700">
          {all.length === 0 ? t('empty') : t('emptySearch')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left dark:border-stone-800">
                <th className="py-2 pr-3 font-medium">{t('table.name')}</th>
                <th className="py-2 pr-3 font-medium">{t('table.attending')}</th>
                <th className="py-2 pr-3 font-medium">{t('table.guests')}</th>
                <th className="py-2 pr-3 font-medium">{t('table.diet')}</th>
                <th className="py-2 pr-3 font-medium">{t('table.message')}</th>
                <th className="py-2 pr-3 font-medium">{t('table.date')}</th>
                <th className="py-2 font-medium">
                  <span className="sr-only">{t('table.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {replies.map((reply) => (
                <tr
                  key={reply.id}
                  className="border-b border-stone-100 align-top dark:border-stone-900"
                >
                  <td className="py-2 pr-3">
                    <span className="font-medium">{reply.name}</span>
                    {reply.email && (
                      <span className="block text-xs text-stone-500">{reply.email}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {reply.attending ? t('attending.yes') : t('attending.no')}
                  </td>
                  <td className="py-2 pr-3">{reply.attending ? reply.guests : '—'}</td>
                  <td className="py-2 pr-3">{reply.diet || '—'}</td>
                  <td className="max-w-xs py-2 pr-3 break-words">{reply.message || '—'}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {format.dateTime(reply.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-2">
                    <form action={deleteRsvpAction}>
                      <input type="hidden" name="invitationId" value={id} />
                      <input type="hidden" name="rsvpId" value={reply.id} />
                      <DeleteReplyButton
                        label={t('delete.action')}
                        confirmLabel={t('delete.confirm')}
                      />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-stone-500">{t('privacy', { months: RSVP_RETENTION_MONTHS })}</p>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 p-3 dark:border-stone-800">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="text-2xl font-semibold">{value}</dd>
    </div>
  );
}
