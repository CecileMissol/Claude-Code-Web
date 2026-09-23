import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Unavailable, unavailableCopy } from './Unavailable';
import { longDate } from '@/content/derived';
import { migrateContent } from '@/content/migrations';
import type { InvitationContent } from '@/content/schema';
import { getDb } from '@/db';
import { getInvitationBySlugAnyStatus } from '@/db/queries';
import { effectiveStatus, publicInvitationUrl } from '@/lib/publish';
import { isReservedSlug } from '@/lib/slugs';
import { loadTheme } from '@/themes/registry';
import type { ThemeModule } from '@/themes/types';
import type { InvitationStatus } from '@/db/schema';

export const dynamic = 'force-dynamic';

/**
 * `/[slug]` — the published invitation a guest opens.
 *
 * The locale comes from the invitation content, never from the visitor's
 * cookie: everyone sees the invitation in the language the couple chose.
 *
 * The page reads the database on every request (`force-dynamic`), which is what
 * makes an edit visible on the public link immediately. A KV cache in front of
 * it is possible but is deliberately not wired up yet — see
 * `docs/phase-5-6-publication-rsvp.md` §2.
 */

interface Loaded {
  content: InvitationContent;
  theme: ThemeModule;
  status: InvitationStatus;
  invitationId: string;
}

async function load(slug: string): Promise<Loaded | null> {
  if (isReservedSlug(slug)) return null;

  const found = await getInvitationBySlugAnyStatus(getDb(), slug);
  if (!found) return null;

  // A draft has no public existence at all: its slug must behave like a 404.
  const status = effectiveStatus(found.invitation);
  if (status === 'draft') return null;

  const theme = await loadTheme(found.themeSlug);
  if (!theme) return null;

  return {
    content: migrateContent(JSON.parse(found.invitation.content)),
    theme,
    status,
    invitationId: found.invitation.id,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await load(slug).catch(() => null);

  // An invitation is never indexed: the link is private between the couple and
  // their guests, and it carries their names, their address and their date.
  const robots = { index: false, follow: false, nocache: true };

  if (!found) return { robots };

  const { content, status } = found;
  const names = `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`;

  if (status !== 'published') {
    return { title: names, robots };
  }

  const title = `${names} — ${longDate(content)}`;
  const description = content.venue.city
    ? `${longDate(content)} · ${content.venue.city}`
    : longDate(content);

  return {
    title: names,
    description,
    robots,
    alternates: { canonical: publicInvitationUrl(slug) },
    openGraph: {
      type: 'website',
      title,
      description,
      url: publicInvitationUrl(slug),
      locale: content.locale === 'fr' ? 'fr_FR' : 'en_GB',
      siteName: names,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) notFound();

  if (found.status !== 'published') {
    return <Unavailable copy={unavailableCopy(found.content.locale, found.status)} />;
  }

  const { Invitation } = found.theme;

  return (
    <Invitation
      content={found.content}
      mode="public"
      slug={slug}
      invitationId={found.invitationId}
    />
  );
}
