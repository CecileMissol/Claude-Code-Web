import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeMigrateContent } from '@/content/migrations';
import { getDb } from '@/db';
import { getInvitationWithThemeForOwner } from '@/db/queries';
import { PreviewBridge } from '@/editor/PreviewBridge';
import { requireUser } from '@/lib/auth';
import { loadTheme } from '@/themes/registry';

/** Always the freshly saved content: the preview must never be cached. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

/**
 * Hides the application chrome inside the preview iframe.
 *
 * The route lives under the `(app)` group, so it inherits the site header and
 * the reading-width container. Rather than duplicating a layout outside that
 * group (a file another agent owns), the frame neutralises them — the rule only
 * ever applies inside the iframe.
 */
const FRAME_CSS = `
  body > header { display: none !important; }
  body > main { max-width: none !important; margin: 0 !important; padding: 0 !important; }
`;

/**
 * `/app/[id]/preview` — the invitation as a guest will see it, rendered by the
 * theme itself and served to the editor's iframe.
 *
 * Rendered on the server because a theme root may be an async Server Component
 * that loads its own messages and CSS. `PreviewBridge` listens for the
 * editor's refresh message and re-runs this render in place.
 *
 * Owner-scoped: someone else's invitation is a 404, so the preview can never
 * become a way to read another couple's draft.
 */
export default async function PreviewInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const owned = await getInvitationWithThemeForOwner(getDb(), id, user.id);
  if (!owned) notFound();

  const theme = await loadTheme(owned.themeSlug);
  if (!theme) notFound();

  const parsed = safeMigrateContent(parseJson(owned.invitation.content));
  if (!parsed.success) notFound();

  const { Invitation } = theme;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FRAME_CSS }} />
      <PreviewBridge />
      <Invitation content={parsed.data} mode="preview" invitationId={id} />
    </>
  );
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
