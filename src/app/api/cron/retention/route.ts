import { cronSecret, purgeExpiredRsvps, secretMatches } from '@/lib/retention';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/cron/retention` — GDPR retention job.
 *
 * Deletes guest replies whose event is more than `RSVP_RETENTION_MONTHS` behind
 * us, and expires the publications that are due.
 *
 * Why an HTTP route and not a Worker `scheduled` handler: `@opennextjs/cloudflare`
 * generates `.open-next/worker.js` on every build and that module exports
 * `fetch` only — there is no supported hook for adding `scheduled` without
 * replacing the Worker entry point, which would mean owning a file the adapter
 * regenerates. See `docs/phase-5-6-publication-rsvp.md` §6 for the wrapper to
 * put in place the day the adapter supports it.
 *
 * Protection: `CRON_SECRET` (32+ random characters), sent as
 * `Authorization: Bearer …` or `?key=…`. Without that variable the route
 * refuses every call — a job that deletes rows must never be open by default.
 */
async function run(request: Request): Promise<Response> {
  const expected = cronSecret();
  if (!expected) {
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  const header = request.headers.get('authorization');
  const bearer = header?.toLowerCase().startsWith('bearer ') ? header.slice(7) : null;
  const provided = bearer ?? new URL(request.url).searchParams.get('key');

  if (!secretMatches(provided, expected)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const report = await purgeExpiredRsvps();
  return Response.json({ ok: true, ...report });
}

export async function POST(request: Request): Promise<Response> {
  return run(request);
}

/** Same job on GET, so a scheduler that can only issue GETs still works. */
export async function GET(request: Request): Promise<Response> {
  return run(request);
}
