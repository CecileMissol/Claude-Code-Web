import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { CopyButton } from './CopyButton';
import { PublishControls } from './PublishControls';
import { QrDownloads } from './QrDownloads';
import { ShareMessages } from './ShareMessages';
import { SlugField } from './SlugField';
import { migrateContent } from '@/content/migrations';
import { getDb } from '@/db';
import { getInvitationForOwner } from '@/db/queries';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config';
import { requireUser } from '@/lib/auth';
import {
  HOSTING_MONTHS,
  appOrigin,
  effectiveStatus,
  publicInvitationUrl,
  publishBlocker,
} from '@/lib/publish';
import { shareContext, shareMessages, type ShareMessage } from '@/lib/share-messages';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from '@/lib/slugs';

export const dynamic = 'force-dynamic';

/** PNG exported by the browser; large enough for a printed A5 card at 300 dpi. */
const PNG_SIZE = 1024;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('share');
  return { title: t('title') };
}

/**
 * `/app/[id]/share` — choose the link, publish, and share.
 *
 * Owner-only, like every `/app` page: the session is resolved first and the
 * invitation is read with that owner id in the WHERE clause.
 */
export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const invitation = await getInvitationForOwner(getDb(), id, user.id);
  if (!invitation) notFound();

  const t = await getTranslations('share');
  const dashboard = await getTranslations('dashboard');
  const format = await getFormatter();

  const content = migrateContent(JSON.parse(invitation.content));
  const status = effectiveStatus(invitation);
  const online = status === 'published';
  const slug = invitation.slug ?? '';
  const url = slug ? publicInvitationUrl(slug) : '';

  const problems = {
    empty: t('link.problems.empty'),
    too_short: t('link.problems.too_short', { min: SLUG_MIN_LENGTH }),
    too_long: t('link.problems.too_long', { max: SLUG_MAX_LENGTH }),
    invalid_characters: t('link.problems.invalid_characters'),
    reserved: t('link.problems.reserved'),
    taken: t('link.problems.taken'),
    missing_slug: t('link.problems.missing_slug'),
    invalid_slug: t('link.problems.invalid_slug'),
    not_found: t('link.problems.not_found'),
    server: t('link.problems.server'),
  };

  const messages = Object.fromEntries(
    LOCALES.map((locale) => [locale, shareMessages(locale, shareContext(content, url, locale))]),
  ) as Record<Locale, ShareMessage[]>;

  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm text-stone-500">
          <Link href="/app" className="underline">
            {dashboard('title')}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-stone-600 dark:text-stone-400">{t('intro')}</p>
      </header>

      {/* ---------------- Status ---------------- */}
      <section className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-stone-500">{t('status.label')}</span>
          <strong>{t(`status.${status}`)}</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-stone-600 dark:text-stone-400">
          {invitation.publishedAt && (
            <li>
              {t('hosting.publishedOn', {
                date: format.dateTime(invitation.publishedAt, { dateStyle: 'long' }),
              })}
            </li>
          )}
          {invitation.expiresAt && (
            <li>
              {t('hosting.expiresOn', {
                date: format.dateTime(invitation.expiresAt, { dateStyle: 'long' }),
              })}
            </li>
          )}
          <li>{t('hosting.notice', { months: HOSTING_MONTHS })}</li>
          {status === 'expired' && (
            <li className="text-amber-700 dark:text-amber-400">{t('hosting.expiredNotice')}</li>
          )}
        </ul>
      </section>

      {/* ---------------- Link ---------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('link.title')}</h2>

        <SlugField
          invitationId={invitation.id}
          initialSlug={slug}
          origin={appOrigin().replace(/^https?:\/\//, '')}
          locked={online}
          labels={{
            label: t('link.label'),
            help: t('link.help', { min: SLUG_MIN_LENGTH, max: SLUG_MAX_LENGTH }),
            placeholder: t('link.placeholder'),
            suggest: t('link.suggest'),
            save: t('link.save'),
            saved: t('link.saved'),
            checking: t('link.checking'),
            available: t('link.available'),
            locked: t('link.locked'),
            problems,
          }}
        />

        {url && (
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded bg-stone-100 px-2 py-1 text-sm break-all dark:bg-stone-900">
              {url}
            </code>
            <CopyButton value={url} label={t('copyLink')} copiedLabel={t('copied')} />
            {online && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                {t('publish.openInvitation')}
              </a>
            )}
          </div>
        )}
      </section>

      {/* ---------------- Publication ---------------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('publish.title')}</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">{t('publish.intro')}</p>
        <p className="text-sm">{online ? t('publish.liveNotice') : t('publish.draftNotice')}</p>

        <PublishControls
          invitationId={invitation.id}
          online={online}
          everPublished={invitation.publishedAt !== null}
          canPublish={publishBlocker(invitation) === null}
          labels={{
            publish: t('publish.cta'),
            republish: t('publish.republish'),
            unpublish: t('publish.unpublish'),
            unpublishHelp: t('publish.unpublishHelp'),
            confirm: t('publish.confirm'),
            needsLink: t('link.problems.missing_slug'),
            problems,
          }}
        />
      </section>

      {/* ---------------- Sharing ---------------- */}
      {online ? (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t('qr.title')}</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">{t('qr.intro')}</p>
            <QrDownloads
              svgUrl={`/api/qr/${slug}`}
              fileName={`${slug}-qr`}
              size={PNG_SIZE}
              labels={{
                alt: t('qr.alt'),
                downloadSvg: t('qr.downloadSvg'),
                downloadPng: t('qr.downloadPng'),
                pngSize: t('qr.pngSize', { size: PNG_SIZE }),
              }}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t('messages.title')}</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">{t('messages.intro')}</p>
            <ShareMessages
              messages={messages}
              contentLocale={content.locale}
              labels={{
                language: t('messages.language'),
                localeNames: LOCALE_LABELS,
                channels: {
                  sms: t('messages.channels.sms'),
                  email: t('messages.channels.email'),
                  whatsapp: t('messages.channels.whatsapp'),
                },
                subject: t('messages.subject'),
                copy: t('messages.copy'),
                copied: t('messages.copied'),
                open: {
                  sms: t('messages.open.sms'),
                  email: t('messages.open.email'),
                  whatsapp: t('messages.open.whatsapp'),
                },
              }}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t('calendar.title')}</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">{t('calendar.intro')}</p>
            <a href={`/api/ics/${slug}`} className="text-sm underline" download={`${slug}.ics`}>
              {t('calendar.download')}
            </a>
          </section>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700">
          {t('publishFirst')}
        </p>
      )}
    </section>
  );
}
