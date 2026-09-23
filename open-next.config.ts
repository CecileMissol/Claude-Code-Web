import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';

/**
 * OpenNext adapter configuration: the Next.js incremental cache is backed by
 * the `NEXT_INC_CACHE_KV` KV namespace declared in wrangler.jsonc.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
