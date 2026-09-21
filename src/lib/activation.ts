import { z } from 'zod';
import type { Database } from '@/db';
import { CONTENT_VERSION, type Locale } from '@/content/schema';
import { defaultContent } from '@/content/defaults';
import { adminEmails } from '@/lib/env';
import { sendMail } from '@/lib/mail';
import { getThemeIdBySlug } from '@/db/seed-themes';
import { isThemeSlug, loadTheme } from '@/themes/registry';
import {
  createActivation,
  createInvitation,
  findActivationByOrderAndTheme,
  getActivationById,
  getOrCreateUserByEmail,
  insertAuditLog,
  markActivationApproved,
  markActivationRejected,
  reopenActivation,
} from '@/db/queries';
import { activationReceivedEmail } from '../../emails/ActivationReceived';
import { activationAdminAlertEmail } from '../../emails/ActivationAdminAlert';
import { activationRejectedEmail } from '../../emails/ActivationRejected';

/**
 * `/activate` business logic: validation, anti-duplicate, the two request
 * emails, and (from `/admin`) approval and refusal.
 *
 * Etsy order numbers observed on the marketplace are 10 digits; the schema
 * accepts 8 to 12 to tolerate format changes without becoming a free-text
 * field.
 */
export const ETSY_ORDER_ID_PATTERN = /^\d{8,12}$/;

export const ActivationInputSchema = z.object({
  etsyOrderId: z.string().trim().regex(ETSY_ORDER_ID_PATTERN),
  email: z
    .string()
    .trim()
    .min(3)
    .transform((value) => value.toLowerCase())
    .pipe(z.email()),
  themeSlug: z.string().refine(isThemeSlug),
  /** Must be checked: acceptance of the terms of sale and the privacy policy. */
  consent: z.literal(true),
});

export type ActivationInput = z.infer<typeof ActivationInputSchema>;

export type SubmitActivationResult =
  | { status: 'invalid'; fieldErrors: Partial<Record<keyof ActivationInput, true>> }
  | { status: 'duplicate-pending' }
  | { status: 'duplicate-approved' }
  | { status: 'created' }
  | { status: 'reopened' };

/**
 * Validates and records an activation request, then emails the buyer (a
 * receipt) and every admin (an alert).
 *
 * Anti-duplicate rule: the same (order, theme) pair can only ever have one
 * row (unique index in `src/db/schema.ts`). A second submission while it is
 * `pending` or `approved` is refused with a tailored status; a second
 * submission after a `rejected` one re-opens that same row instead of
 * failing, so a buyer who fixes a typo is not permanently locked out.
 */
export async function submitActivationRequest(
  db: Database,
  rawInput: unknown,
): Promise<SubmitActivationResult> {
  const parsed = ActivationInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ActivationInput, true>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') fieldErrors[key as keyof ActivationInput] = true;
    }
    return { status: 'invalid', fieldErrors };
  }

  const input = parsed.data;
  const themeId = await getThemeIdBySlug(db, input.themeSlug);
  if (!themeId) return { status: 'invalid', fieldErrors: { themeSlug: true } };

  const existing = await findActivationByOrderAndTheme(db, input.etsyOrderId, themeId);
  if (existing?.status === 'pending') return { status: 'duplicate-pending' };
  if (existing?.status === 'approved') return { status: 'duplicate-approved' };

  if (existing?.status === 'rejected') {
    await reopenActivation(db, existing.id, input.email);
  } else {
    await createActivation(db, { etsyOrderId: input.etsyOrderId, email: input.email, themeId });
  }

  const theme = await loadTheme(input.themeSlug);
  const themeName = theme?.manifest.name.en ?? input.themeSlug;

  await Promise.all([
    sendMail(activationReceivedEmail({ to: input.email, orderId: input.etsyOrderId, themeName })),
    ...adminEmails().map((admin) =>
      sendMail(
        activationAdminAlertEmail({
          to: admin,
          orderId: input.etsyOrderId,
          buyerEmail: input.email,
          themeName,
        }),
      ),
    ),
  ]);

  return { status: existing?.status === 'rejected' ? 'reopened' : 'created' };
}

export interface ApproveActivationInput {
  activationId: string;
  adminEmail: string;
  locale: Locale;
}

export interface ApproveActivationResult {
  invitationId: string;
  buyerEmail: string;
}

/**
 * Approves a pending activation: gets or creates the buyer's account,
 * creates a draft invitation on the purchased theme with locale-appropriate
 * default content, marks the activation `approved`, and writes an audit log
 * entry. Sending the "your invitation is ready" magic-link email is the
 * caller's job (`src/app/(app)/admin/actions.ts`) — it goes through Better
 * Auth's own sign-in endpoint so the link it contains actually works.
 */
export async function approveActivationRequest(
  db: Database,
  input: ApproveActivationInput,
): Promise<ApproveActivationResult | null> {
  const activation = await getActivationById(db, input.activationId);
  if (!activation || activation.status !== 'pending') return null;

  const buyer = await getOrCreateUserByEmail(db, activation.email);

  const invitation = await createInvitation(db, {
    ownerId: buyer.id,
    themeId: activation.themeId,
    locale: input.locale,
    content: JSON.stringify(defaultContent(input.locale)),
    contentVersion: CONTENT_VERSION,
  });

  await markActivationApproved(db, activation.id, buyer.id);

  await insertAuditLog(db, {
    actorEmail: input.adminEmail,
    action: 'activation.approved',
    targetType: 'activation',
    targetId: activation.id,
    meta: { invitationId: invitation.id, buyerEmail: buyer.email, locale: input.locale },
  });

  return { invitationId: invitation.id, buyerEmail: buyer.email };
}

export interface RejectActivationInput {
  activationId: string;
  adminEmail: string;
  reason?: string;
}

/** Refuses a pending activation and emails the buyer with the optional reason. */
export async function rejectActivationRequest(
  db: Database,
  input: RejectActivationInput,
): Promise<boolean> {
  const activation = await getActivationById(db, input.activationId);
  if (!activation || activation.status !== 'pending') return false;

  await markActivationRejected(db, activation.id);

  await insertAuditLog(db, {
    actorEmail: input.adminEmail,
    action: 'activation.rejected',
    targetType: 'activation',
    targetId: activation.id,
    meta: { reason: input.reason ?? null },
  });

  await sendMail(
    activationRejectedEmail({
      to: activation.email,
      orderId: activation.etsyOrderId,
      reason: input.reason,
    }),
  );

  return true;
}
