/**
 * Worker entry point.
 *
 * `opennextjs-cloudflare build` regenerates `.open-next/worker.js` on every
 * build and that module exports `fetch` only: a Cron Trigger has nothing to
 * call. Rather than patch a generated file, this module wraps it — the
 * documented way to extend the adapter's Worker — and `wrangler.jsonc` points
 * `main` here instead of at `.open-next/worker.js`.
 *
 * `fetch` is delegated untouched; the only addition is `scheduled()`, which
 * runs the GDPR retention job declared in `triggers.crons`.
 *
 * The generated module is imported as `open-next-worker`, an alias declared in
 * `wrangler.jsonc` (and typed in `worker/open-next-worker.d.ts`), so this file
 * typechecks on a fresh clone where `.open-next/` does not exist yet.
 *
 * Imports are relative on purpose: the code they pull in is bundled by
 * wrangler, not by Next.js.
 */

import generated from 'open-next-worker';
import { createDb } from '../src/db';
import { purgeExpiredRsvps } from '../src/lib/retention';

// Durable Object classes the adapter may declare; re-exported unchanged so the
// wrapper can be dropped in without touching the rest of the configuration.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from 'open-next-worker';

/**
 * Deletes the replies whose event is long past and expires the publications
 * whose hosting window has closed.
 *
 * `getCloudflareContext()` is only populated inside a request, so the D1
 * binding is taken from the `env` the runtime hands to `scheduled()` and passed
 * explicitly to the job.
 */
async function runRetention(env: CloudflareEnv): Promise<void> {
  if (!env.DB) {
    console.error('Retention job skipped: missing D1 binding "DB".');
    return;
  }

  try {
    const report = await purgeExpiredRsvps(createDb(env.DB));
    console.info(
      `Retention: ${report.deletedRsvps} reply/replies deleted (events before ${report.cutoff}), ` +
        `${report.expiredInvitations} invitation(s) expired.`,
    );
  } catch (error) {
    // A failed run must never take the Worker down: the next trigger (or
    // POST /api/cron/retention) will try again, and the job is idempotent.
    console.error('Retention job failed:', error);
  }
}

export default {
  fetch(request, env, ctx) {
    return generated.fetch(request, env, ctx);
  },

  scheduled(_controller, env, ctx) {
    // `waitUntil` keeps the Worker alive until the purge is done.
    ctx.waitUntil(runRetention(env));
  },
} satisfies ExportedHandler<CloudflareEnv>;
