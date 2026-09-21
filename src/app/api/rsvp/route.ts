import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { renderRsvpNotification } from '../../../../emails/RsvpNotification';
import { migrateContent } from '@/content/migrations';
import { RsvpSubmission, type RsvpResult } from '@/content/rsvp';
import { getDbAsync, type Database } from '@/db';
import {
  countRecentRsvpsByIp,
  getInvitationBySlugAnyStatus,
  getInvitationOwnerEmail,
  insertRsvp,
  markRsvpNotified,
  rsvpStatsForOwner,
} from '@/db/queries';
import { rsvpIpSalt } from '@/lib/env';
import { sendMail } from '@/lib/mail';
import { appOrigin, isDeadlinePassed, isPubliclyVisible } from '@/lib/publish';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import type { Invitation, Rsvp } from '@/db/schema';
import type { InvitationContent } from '@/content/schema';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/rsvp` — the only public write in the application.
 *
 * Defences, in order: honeypot (answered with a silent success so a bot never
 * learns it was caught), schema validation, publication check, RSVP window
 * check, then a two-layer rate limit — the Workers limiter for speed, and an
 * exact per-invitation count in the database, which survives a change of
 * isolate. The guest IP is never stored, only a salted hash of it.
 */

type RsvpError = Extract<RsvpResult, { ok: false }>['error'];

const RATE_LIMIT_REPLIES = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const STATUS: Record<RsvpError, number> = {
  invalid: 400,
  rate_limited: 429,
  closed: 403,
  not_found: 404,
  server: 500,
};

function fail(error: RsvpError): NextResponse {
  return NextResponse.json({ ok: false, error }, { status: STATUS[error] });
}

/** Client IP, as Cloudflare sees it. */
function clientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Runs a background task after the response when the platform allows it. */
async function runAfterResponse(task: Promise<unknown>): Promise<void> {
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(task.catch(() => undefined));
      return;
    }
  } catch {
    // No Cloudflare context (plain `next dev`, tests): fall through.
  }
  await task.catch(() => undefined);
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail('invalid');
  }

  // Honeypot first: a filled trap gets the exact response a success gets, so a
  // bot cannot tell the difference and keeps wasting its time.
  const trap = (payload as { website?: unknown } | null)?.website;
  if (typeof trap === 'string' && trap.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = RsvpSubmission.safeParse(payload);
  if (!parsed.success) return fail('invalid');
  const submission = parsed.data;

  let db: Database;
  try {
    db = await getDbAsync();
  } catch {
    return fail('server');
  }

  const found = await getInvitationBySlugAnyStatus(db, submission.slug);
  if (!found || !isPubliclyVisible(found.invitation)) return fail('not_found');

  let content: InvitationContent;
  try {
    content = migrateContent(JSON.parse(found.invitation.content));
  } catch {
    return fail('server');
  }

  const settings = content.rsvp;
  if (!settings.enabled) return fail('closed');
  if (isDeadlinePassed(settings.deadline, content.event.timezone)) return fail('closed');

  const ipHash = await hashIp(clientIp(request), rsvpIpSalt());

  const limiter = await checkRateLimit(`rsvp:${found.invitation.id}:${ipHash}`, {
    limit: RATE_LIMIT_REPLIES,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!limiter.success) return fail('rate_limited');

  const recent = await countRecentRsvpsByIp(
    db,
    found.invitation.id,
    ipHash,
    new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
  );
  if (recent >= RATE_LIMIT_REPLIES) return fail('rate_limited');

  // Fields the couple did not ask for are dropped rather than stored, and the
  // party size is clamped: lowering `maxGuestsPerReply` after a few replies
  // must not start rejecting honest guests.
  const email = settings.askEmail ? submission.email?.trim() || null : null;
  const diet = settings.askDiet ? submission.diet?.trim() || null : null;
  const message = settings.askMessage ? submission.message?.trim() || null : null;
  const guests = submission.attending
    ? Math.min(Math.max(submission.guests, 1), settings.maxGuestsPerReply)
    : 1;

  let saved;
  try {
    saved = await insertRsvp(db, {
      invitationId: found.invitation.id,
      name: submission.name,
      email,
      attending: submission.attending,
      guests,
      diet,
      message,
      ipHash,
    });
  } catch {
    return fail('server');
  }

  if (settings.notifyByEmail) {
    await runAfterResponse(notifyCouple(db, found.invitation, content, saved));
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Sends the "new reply" e-mail and stamps the row so a retry cannot double it. */
async function notifyCouple(
  db: Database,
  invitation: Invitation,
  content: InvitationContent,
  reply: Rsvp,
): Promise<void> {
  if (reply.notifiedAt) return;

  const to = await getInvitationOwnerEmail(db, invitation.id);
  if (!to) return;

  const totals = await rsvpStatsForOwner(db, invitation.id, invitation.ownerId);

  const mail = renderRsvpNotification({
    locale: content.locale,
    names: `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`,
    guestName: reply.name,
    attending: reply.attending,
    guests: reply.guests,
    email: reply.email,
    diet: reply.diet,
    message: reply.message,
    dashboardUrl: `${appOrigin()}/app/${invitation.id}/responses`,
    totals: { yes: totals.yes, no: totals.no, people: totals.people },
  });

  await sendMail({ to, subject: mail.subject, text: mail.text, html: mail.html });
  await markRsvpNotified(db, reply.id);
}
