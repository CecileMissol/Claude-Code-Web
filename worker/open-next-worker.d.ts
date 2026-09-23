/**
 * Types for the Worker that `opennextjs-cloudflare build` generates in
 * `.open-next/worker.js`.
 *
 * That file only exists after a build, so `worker/index.ts` imports it under
 * the stable name `open-next-worker`, mapped to the real path by the `alias`
 * entry of `wrangler.jsonc`. This declaration is what makes `pnpm typecheck`
 * pass on a fresh clone, before anything has been built.
 *
 * The generated module exports a `fetch`-only default handler, plus the three
 * Durable Object classes the adapter may use (queue, sharded tag cache, bucket
 * cache purge). `worker/index.ts` re-exports them unchanged.
 */
declare module 'open-next-worker' {
  const handler: {
    fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response>;
  };
  export default handler;

  export const DOQueueHandler: unknown;
  export const DOShardedTagCache: unknown;
  export const BucketCachePurge: unknown;
}
