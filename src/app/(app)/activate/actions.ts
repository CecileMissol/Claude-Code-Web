'use server';

import { headers } from 'next/headers';
import { getDb } from '@/db';
import { getEnv } from '@/lib/env';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { submitActivationRequest, type ActivationInput } from '@/lib/activation';

export type ActivationFormStatus =
  | 'idle'
  | 'success'
  | 'reopened'
  | 'duplicate-pending'
  | 'duplicate-approved'
  | 'invalid'
  | 'rate-limited'
  | 'error';

export interface ActivationFormState {
  status: ActivationFormStatus;
  fieldErrors?: Partial<Record<keyof ActivationInput, true>>;
}

// No runtime constant here: a `'use server'` file may only export async
// functions (and types, which are erased) — see `ActivationForm.tsx` for the
// initial state value.

/** Up to 5 activation attempts per IP every 10 minutes. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60_000 };

async function clientIpHash(): Promise<string> {
  const headerStore = await headers();
  const ip =
    headerStore.get('cf-connecting-ip') ??
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  return hashIp(ip, getEnv().BETTER_AUTH_SECRET);
}

/**
 * Server Action bound to `<ActivationForm>`. Rate-limited per IP, then
 * delegates validation and persistence to `submitActivationRequest`.
 */
export async function submitActivationAction(
  _previous: ActivationFormState,
  formData: FormData,
): Promise<ActivationFormState> {
  const ipHash = await clientIpHash();
  const limit = await checkRateLimit(`activate:${ipHash}`, RATE_LIMIT);
  if (!limit.success) return { status: 'rate-limited' };

  const rawInput = {
    etsyOrderId: String(formData.get('etsyOrderId') ?? ''),
    email: String(formData.get('email') ?? ''),
    themeSlug: String(formData.get('themeSlug') ?? ''),
    consent: formData.get('consent') === 'on',
  };

  try {
    const result = await submitActivationRequest(getDb(), rawInput);

    if (result.status === 'invalid') return { status: 'invalid', fieldErrors: result.fieldErrors };
    if (result.status === 'created') return { status: 'success' };
    return { status: result.status };
  } catch {
    return { status: 'error' };
  }
}
