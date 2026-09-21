'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/db';
import { extendInvitationExpiry, setInvitationEnabled } from '@/db/queries';
import { getAuth, requireAdmin } from '@/lib/auth';
import { approveActivationRequest, rejectActivationRequest } from '@/lib/activation';
import { isLocale, type Locale } from '@/i18n/config';

/** Approves a pending activation, then sends the real "invitation ready" magic link. */
export async function approveActivationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const rawLocale = formData.get('locale');
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'en';

  const db = getDb();
  const result = await approveActivationRequest(db, { activationId: id, adminEmail: admin.email, locale });

  if (result) {
    // Goes through Better Auth's own endpoint so the mailed link is a real,
    // working sign-in link — see the `sendMagicLink` hook in `src/lib/auth.ts`.
    await getAuth().api.signInMagicLink({
      body: {
        email: result.buyerEmail,
        callbackURL: '/app',
        metadata: { kind: 'activation-approved', locale },
      },
      headers: new Headers(),
    });
  }

  revalidatePath('/admin');
}

export async function rejectActivationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const reason = String(formData.get('reason') ?? '').trim();

  await rejectActivationRequest(getDb(), {
    activationId: id,
    adminEmail: admin.email,
    reason: reason.length > 0 ? reason : undefined,
  });

  revalidatePath('/admin');
}

export async function extendInvitationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await extendInvitationExpiry(getDb(), id, 12);
  revalidatePath('/admin');
}

export async function toggleInvitationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const enabled = formData.get('enabled') === 'true';
  await setInvitationEnabled(getDb(), id, enabled);
  revalidatePath('/admin');
}
