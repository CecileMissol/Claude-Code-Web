import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { safeMigrateContent } from '@/content/migrations';
import { getDb } from '@/db';
import { getInvitationWithThemeForOwner } from '@/db/queries';
import { EditorShell } from '@/editor/EditorShell';
import { extrasGroups } from '@/editor/extras';
import { buildEditorSteps } from '@/editor/manifest';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { requireUser } from '@/lib/auth';
import { loadTheme } from '@/themes/registry';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('editor');
  return { title: t('title'), robots: { index: false } };
}

/**
 * `/app/[id]/edit` — the step-by-step editor with its live preview.
 *
 * Everything the form offers is derived here, on the server, from the theme the
 * invitation was created with: its manifest gives the fields and their bounds,
 * its `Extras` schema gives the decorative blocks. The client shell only ever
 * receives plain data.
 *
 * Access: `requireUser()` then an owner-scoped query. Someone else's id is a
 * 404, exactly like an id that does not exist.
 */
export default async function EditInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const owned = await getInvitationWithThemeForOwner(getDb(), id, user.id);
  if (!owned) notFound();

  const theme = await loadTheme(owned.themeSlug);
  if (!theme) notFound();

  const parsed = safeMigrateContent(parseJson(owned.invitation.content));
  if (!parsed.success) notFound();

  const steps = buildEditorSteps(theme.manifest, { extras: extrasGroups(theme.Extras) });
  const rawLocale = await getLocale();

  return (
    <EditorShell
      invitationId={id}
      initialContent={parsed.data as unknown as Record<string, unknown>}
      steps={steps}
      locale={isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE}
      previewSrc={`/app/${id}/preview`}
    />
  );
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
