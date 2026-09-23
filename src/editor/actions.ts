'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CONTENT_VERSION } from '@/content/schema';
import { defaultContent } from '@/content/defaults';
import { getDb } from '@/db';
import { ensureThemeSeeded } from '@/db/seed';
import {
  createInvitation,
  getInvitationWithThemeForOwner,
  updateInvitationContentForOwner,
} from '@/db/queries';
import { requireUser } from '@/lib/auth';
import { allowFreeDrafts } from '@/lib/env';
import { getUserLocale } from '@/i18n/locale';
import { loadTheme } from '@/themes/registry';
import { parseDraftContent } from './content-schema';
import { DEFAULT_THEME_SLUG } from './constants';

/**
 * Server Actions of the editor.
 *
 * Both of them start with `requireUser()` and scope every query to the signed-in
 * owner: there is no row-level security on D1, so a couple can only ever read or
 * write its own invitation — `tests/unit/editor/access.test.ts` proves it.
 */

export interface SaveIssue {
  /** Dot path inside the content, e.g. `couple.partner1.firstName`. */
  path: string;
  /** Issue code, translated by the client (`errors.*`). */
  code: string;
}

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: 'forbidden' | 'invalid' | 'server'; issues?: SaveIssue[] };

/**
 * Creates a blank draft on the default theme and opens the editor.
 *
 * A buyer never comes through here: their draft is created by the Etsy
 * activation. This entry point is reserved for administrators and for
 * development (`ALLOW_FREE_DRAFTS=true`); anybody else is sent to `/activate`.
 * The dashboard hides the button under the same rule, and this check is what
 * actually enforces it — a form can be posted without the page.
 *
 * The content is the localised default of `src/content/defaults.ts`, restyled
 * with the theme's own default palette.
 */
export async function createDraftInvitationAction(): Promise<void> {
  const user = await requireUser();
  if (!user.isAdmin && !allowFreeDrafts()) redirect('/activate');

  const db = getDb();

  const theme = await ensureThemeSeeded(db, DEFAULT_THEME_SLUG);
  const themeModule = await loadTheme(DEFAULT_THEME_SLUG);
  if (!themeModule) throw new Error(`Unknown theme "${DEFAULT_THEME_SLUG}".`);

  const locale = await getUserLocale();
  const content = defaultContent(locale);
  content.style = {
    paletteId: themeModule.manifest.defaultPaletteId,
    scriptId: themeModule.manifest.defaultScriptId,
  };

  const invitation = await createInvitation(db, {
    ownerId: user.id,
    themeId: theme.id,
    locale,
    content: JSON.stringify(content),
    contentVersion: CONTENT_VERSION,
  });

  revalidatePath('/app');
  redirect(`/app/${invitation.id}/edit`);
}

/**
 * Validates and stores a draft.
 *
 * The payload is re-validated server-side against the common content schema
 * bounded by the theme manifest, plus the theme's own `Extras` schema; whatever
 * the browser sent is never trusted.
 */
export async function saveInvitationContentAction(
  invitationId: string,
  content: unknown,
): Promise<SaveResult> {
  const user = await requireUser();
  const db = getDb();

  const owned = await getInvitationWithThemeForOwner(db, invitationId, user.id);
  if (!owned) return { ok: false, error: 'forbidden' };

  const theme = await loadTheme(owned.themeSlug);
  if (!theme) return { ok: false, error: 'server' };

  const parsed = parseDraftContent(theme.manifest, theme.Extras, content);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid',
      issues: parsed.error.issues.slice(0, 20).map((issue) => ({
        path: issue.path.join('.'),
        code: issue.message,
      })),
    };
  }

  // `invitations.locale` follows `content.locale`: the couple changes the
  // language of their invitation in the editor, and the column is what the
  // dashboard and the e-mails read.
  const updated = await updateInvitationContentForOwner(
    db,
    invitationId,
    user.id,
    JSON.stringify(parsed.data),
    CONTENT_VERSION,
    parsed.data.locale,
  );
  if (!updated) return { ok: false, error: 'forbidden' };

  return { ok: true, updatedAt: updated.updatedAt.toISOString() };
}
