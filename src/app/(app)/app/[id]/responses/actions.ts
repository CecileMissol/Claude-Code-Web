'use server';

import { revalidatePath } from 'next/cache';
import { migrateContent } from '@/content/migrations';
import { CONTENT_VERSION } from '@/content/schema';
import { getDbAsync } from '@/db';
import {
  deleteRsvpForOwner,
  getInvitationForOwner,
  updateInvitationContentForOwner,
} from '@/db/queries';
import { requireUser } from '@/lib/auth';

/**
 * Server actions of the responses dashboard.
 *
 * Both are plain `<form action>` submissions, so the page keeps working with
 * JavaScript disabled. Ownership is re-checked here, never assumed from the
 * page that rendered the button.
 */

/** Removes one reply. */
export async function deleteRsvpAction(formData: FormData): Promise<void> {
  const invitationId = String(formData.get('invitationId') ?? '');
  const rsvpId = String(formData.get('rsvpId') ?? '');

  const user = await requireUser();
  const db = await getDbAsync();

  await deleteRsvpForOwner(db, rsvpId, invitationId, user.id);
  revalidatePath(`/app/${invitationId}/responses`);
}

/**
 * Turns the "new reply" e-mail on or off.
 *
 * The flag lives inside the content JSON (`rsvp.notifyByEmail`), so it is
 * written through the existing content update query rather than through a
 * column of its own.
 */
export async function toggleNotifyAction(formData: FormData): Promise<void> {
  const invitationId = String(formData.get('invitationId') ?? '');
  const enabled = String(formData.get('enabled') ?? '') === 'true';

  const user = await requireUser();
  const db = await getDbAsync();

  const invitation = await getInvitationForOwner(db, invitationId, user.id);
  if (!invitation) return;

  const content = migrateContent(JSON.parse(invitation.content));
  const next = { ...content, rsvp: { ...content.rsvp, notifyByEmail: enabled } };

  await updateInvitationContentForOwner(
    db,
    invitationId,
    user.id,
    JSON.stringify(next),
    CONTENT_VERSION,
  );

  revalidatePath(`/app/${invitationId}/responses`);
}
