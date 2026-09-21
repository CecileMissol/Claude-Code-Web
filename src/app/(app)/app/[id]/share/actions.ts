'use server';

import { revalidatePath } from 'next/cache';
import { migrateContent } from '@/content/migrations';
import { getDbAsync } from '@/db';
import {
  getInvitationForOwner,
  isSlugTaken,
  publishInvitationForOwner,
  setInvitationSlugForOwner,
  unpublishInvitationForOwner,
} from '@/db/queries';
import { requireUser } from '@/lib/auth';
import {
  HOSTING_MONTHS,
  checkSlugShape,
  hostingExpiry,
  publishBlocker,
  type SlugProblem,
} from '@/lib/publish';
import { slugify, suggestSlug } from '@/lib/slugs';

/**
 * Server actions behind the share page.
 *
 * They replace a `/api/slug-check` style endpoint: the availability check runs
 * as an action called from the client component, so there is one fewer public
 * route to guard and ownership is enforced in exactly one place — `requireUser`
 * plus an owner-scoped read, at the top of every action.
 */

export interface SlugCheckResult {
  /** The normalised candidate the couple would actually get. */
  slug: string;
  available: boolean;
  problem?: SlugProblem;
}

/** Live availability check, called on every keystroke (debounced client side). */
export async function checkSlugAction(
  invitationId: string,
  candidate: string,
): Promise<SlugCheckResult> {
  const user = await requireUser();
  const db = await getDbAsync();

  const invitation = await getInvitationForOwner(db, invitationId, user.id);
  if (!invitation) return { slug: '', available: false, problem: 'invalid_characters' };

  const slug = slugify(candidate);
  const shape = checkSlugShape(slug);
  if (!shape.ok) return { slug, available: false, problem: shape.problem };

  if (await isSlugTaken(db, slug, invitationId)) {
    return { slug, available: false, problem: 'taken' };
  }

  return { slug, available: true };
}

/** A slug built from the couple's first names, free at the time of the call. */
export async function suggestSlugAction(invitationId: string): Promise<string> {
  const user = await requireUser();
  const db = await getDbAsync();

  const invitation = await getInvitationForOwner(db, invitationId, user.id);
  if (!invitation) return '';

  const content = migrateContent(JSON.parse(invitation.content));
  const base = suggestSlug(
    content.couple.partner1.firstName,
    content.couple.partner2.firstName,
    content.locale,
  );
  if (!base) return '';

  if (!(await isSlugTaken(db, base, invitationId))) return base;

  for (let index = 2; index <= 20; index += 1) {
    const candidate = `${base}-${index}`;
    if (!(await isSlugTaken(db, candidate, invitationId))) return candidate;
  }

  return base;
}

export interface ActionResult {
  ok: boolean;
  problem?: SlugProblem | 'missing_slug' | 'invalid_slug' | 'not_found' | 'server';
}

/**
 * Stores the chosen link without publishing.
 * Shaped for `useActionState`, so the client component can show the problem.
 */
export async function saveSlugAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const invitationId = String(formData.get('id') ?? '');
  const candidate = slugify(String(formData.get('slug') ?? ''));

  const user = await requireUser();
  const db = await getDbAsync();

  const invitation = await getInvitationForOwner(db, invitationId, user.id);
  if (!invitation) return { ok: false, problem: 'not_found' };

  const shape = checkSlugShape(candidate);
  if (!shape.ok) return { ok: false, problem: shape.problem };

  if (await isSlugTaken(db, candidate, invitationId)) return { ok: false, problem: 'taken' };

  try {
    await setInvitationSlugForOwner(db, invitationId, user.id, candidate);
  } catch {
    // Lost a race against the unique index.
    return { ok: false, problem: 'taken' };
  }

  revalidatePath(`/app/${invitationId}/share`);
  return { ok: true };
}

/**
 * Publishes the invitation: fixes the slug when one is submitted, flips the
 * status and starts the {@link HOSTING_MONTHS} hosting window.
 */
export async function publishAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const invitationId = String(formData.get('id') ?? '');
  const submitted = String(formData.get('slug') ?? '').trim();

  const user = await requireUser();
  const db = await getDbAsync();

  const invitation = await getInvitationForOwner(db, invitationId, user.id);
  if (!invitation) return { ok: false, problem: 'not_found' };

  let slug = invitation.slug;

  if (submitted) {
    const candidate = slugify(submitted);
    const shape = checkSlugShape(candidate);
    if (!shape.ok) return { ok: false, problem: shape.problem };
    if (await isSlugTaken(db, candidate, invitationId)) return { ok: false, problem: 'taken' };
    slug = candidate;
  }

  const blocker = publishBlocker({ slug });
  if (blocker) return { ok: false, problem: blocker };

  const publishedAt = invitation.publishedAt ?? new Date();

  try {
    await publishInvitationForOwner(db, invitationId, user.id, {
      publishedAt,
      expiresAt: hostingExpiry(publishedAt, HOSTING_MONTHS),
      ...(slug && slug !== invitation.slug ? { slug } : {}),
    });
  } catch {
    return { ok: false, problem: 'taken' };
  }

  revalidatePath(`/app/${invitationId}/share`);
  revalidatePath('/app');
  if (slug) revalidatePath(`/${slug}`);
  return { ok: true };
}

/** Takes the invitation offline. The link is kept for a later re-publication. */
export async function unpublishAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const invitationId = String(formData.get('id') ?? '');

  const user = await requireUser();
  const db = await getDbAsync();

  const invitation = await getInvitationForOwner(db, invitationId, user.id);
  if (!invitation) return { ok: false, problem: 'not_found' };

  await unpublishInvitationForOwner(db, invitationId, user.id);

  revalidatePath(`/app/${invitationId}/share`);
  revalidatePath('/app');
  if (invitation.slug) revalidatePath(`/${invitation.slug}`);
  return { ok: true };
}
