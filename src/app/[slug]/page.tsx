import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { migrateContent } from '@/content/migrations';
import { getDb } from '@/db';
import { getPublishedInvitationWithTheme } from '@/db/queries';
import { isReservedSlug } from '@/lib/slugs';
import { loadTheme } from '@/themes/registry';

export const dynamic = 'force-dynamic';

async function load(slug: string) {
  if (isReservedSlug(slug)) return null;

  const published = await getPublishedInvitationWithTheme(getDb(), slug);
  if (!published) return null;

  const theme = await loadTheme(published.themeSlug);
  if (!theme) return null;

  return { invitation: published.invitation, theme };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await load(slug).catch(() => null);
  if (!found) return {};

  const content = migrateContent(JSON.parse(found.invitation.content));
  const names = `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`;

  return { title: names, robots: { index: false } };
}

/**
 * `/[slug]` — the published invitation a guest opens.
 *
 * The locale comes from the invitation content, never from the visitor's
 * cookie: everyone sees the invitation in the language the couple chose.
 */
export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await load(slug);
  if (!found) notFound();

  const content = migrateContent(JSON.parse(found.invitation.content));
  const { Invitation } = found.theme;

  return <Invitation content={content} mode="public" />;
}
