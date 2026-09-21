import type { RsvpResult, RsvpSubmission } from '@/content/rsvp';

/**
 * Sends a guest reply to `/api/rsvp`. Safe to call from a client component.
 * Themes call this from their RSVP section; in `preview` and `demo` modes they
 * must NOT call it and should fake a success instead.
 */
export async function submitRsvp(input: RsvpSubmission): Promise<RsvpResult> {
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (response.ok) return { ok: true };
    const body = (await response.json().catch(() => null)) as {
      error?: RsvpResult['ok'] extends true ? never : string;
    } | null;
    const error = body?.error;
    if (
      error === 'invalid' ||
      error === 'rate_limited' ||
      error === 'closed' ||
      error === 'not_found'
    ) {
      return { ok: false, error };
    }
    return { ok: false, error: 'server' };
  } catch {
    return { ok: false, error: 'server' };
  }
}
