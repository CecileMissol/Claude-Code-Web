import { z } from 'zod';

/**
 * Contract between a theme's RSVP section (client side) and the RSVP API.
 * Themes only ever import these types and `submitRsvp` from
 * `@/lib/rsvp-client`; the route handler lives in `src/app/api/rsvp/`.
 */

export const RsvpSubmission = z.object({
  /** Public slug of the invitation the guest is answering. */
  slug: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(10).default(1),
  diet: z.string().trim().max(200).optional(),
  message: z.string().trim().max(600).optional(),
  /** Honeypot: must stay empty. Bots fill it, humans never see it. */
  website: z.string().max(0).optional(),
});
export type RsvpSubmission = z.infer<typeof RsvpSubmission>;

export type RsvpResult =
  | { ok: true }
  | { ok: false; error: 'invalid' | 'rate_limited' | 'closed' | 'not_found' | 'server' };
