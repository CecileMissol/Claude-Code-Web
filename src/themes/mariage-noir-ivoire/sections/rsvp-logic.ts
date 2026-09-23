import type { RsvpResult, RsvpSubmission } from '@/content/rsvp';
import type { InvitationMode } from '../../types';
import type { Messages } from '../messages';

/**
 * Decision logic of the RSVP form, kept free of React and of the DOM so it can
 * be unit-tested without a browser.
 */

/**
 * Only a published invitation may write a reply.
 *
 * The editor preview (`preview`) and the Etsy showcase (`demo`) must never
 * reach `/api/rsvp`: they have no slug to answer for, and a test reply in the
 * couple's dashboard would be worse than no reply at all. A missing slug in
 * `public` mode is treated the same way, defensively.
 */
export function shouldCallApi(mode: InvitationMode, slug: string | undefined): slug is string {
  return mode === 'public' && typeof slug === 'string' && slug.length > 0;
}

/** Reads the form into the payload the API expects. */
export function buildSubmission(form: FormData, slug: string): RsvpSubmission {
  const text = (name: string) => String(form.get(name) ?? '').trim();

  return {
    slug,
    name: text('name'),
    email: text('email'),
    attending: form.get('attending') === 'yes',
    guests: clampGuests(Number(form.get('guests') ?? 1)),
    diet: text('diet'),
    message: text('message'),
    // Read untrimmed: a bot that types a single space must still be caught.
    website: String(form.get('website') ?? ''),
  };
}

/** The API accepts 1 to 10 guests; anything else is coerced into range. */
export function clampGuests(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.round(value)));
}

/** A filled honeypot means a bot filled the form. */
export function isHoneypotFilled(submission: Pick<RsvpSubmission, 'website'>): boolean {
  return (submission.website ?? '') !== '';
}

/** Turns an API failure into a sentence the guest can act on. */
export function errorMessage(
  error: Extract<RsvpResult, { ok: false }>['error'],
  t: Messages,
): string {
  switch (error) {
    case 'rate_limited':
      return t.rsvp.errors.rateLimited;
    case 'closed':
      return t.rsvp.closed;
    case 'invalid':
      return t.rsvp.errors.invalid;
    default:
      return t.rsvp.errors.server;
  }
}
