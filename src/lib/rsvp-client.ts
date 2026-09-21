import type { RsvpResult, RsvpSubmission } from '@/content/rsvp';

/**
 * Sends a guest reply to `/api/rsvp`. Safe to call from a client component.
 * Themes call this from their RSVP section; in `preview` and `demo` modes they
 * must NOT call it and should fake a success instead.
 */

type RsvpError = Extract<RsvpResult, { ok: false }>['error'];

const KNOWN_ERRORS: readonly RsvpError[] = [
  'invalid',
  'rate_limited',
  'closed',
  'not_found',
  'server',
];

function asRsvpError(value: unknown): RsvpError {
  return KNOWN_ERRORS.includes(value as RsvpError) ? (value as RsvpError) : 'server';
}

export async function submitRsvp(input: RsvpSubmission): Promise<RsvpResult> {
  let response: Response;

  try {
    response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    // Offline, DNS failure, request blocked: nothing reached the server.
    return { ok: false, error: 'server' };
  }

  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: unknown;
  } | null;

  if (response.ok && body?.ok !== false) return { ok: true };

  return { ok: false, error: asRsvpError(body?.error) };
}
