import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Rate limiting.
 *
 * Uses the native Workers rate limiter (`RATE_LIMITER` binding, declared under
 * `ratelimits` in wrangler.jsonc) when it is available, and falls back to an
 * in-process sliding window otherwise — which is what happens in `next dev`,
 * in unit tests, and on any runtime without the binding.
 *
 * The fallback is per-isolate and therefore approximate. It is a safety net,
 * never the real defence.
 */

export interface RateLimitResult {
  success: boolean;
  /** Which implementation answered. */
  driver: 'binding' | 'memory';
}

export interface MemoryLimitOptions {
  /** Maximum number of hits inside the window. */
  limit: number;
  /** Window length, in milliseconds. */
  windowMs: number;
}

const DEFAULT_MEMORY_OPTIONS: MemoryLimitOptions = { limit: 20, windowMs: 60_000 };

const hits = new Map<string, number[]>();

/** In-memory sliding window. Exported for tests. */
export function memoryRateLimit(
  key: string,
  options: MemoryLimitOptions = DEFAULT_MEMORY_OPTIONS,
  now: number = Date.now(),
): RateLimitResult {
  const since = now - options.windowMs;
  const previous = hits.get(key) ?? [];
  const recent = previous.filter((timestamp) => timestamp > since);

  if (recent.length >= options.limit) {
    hits.set(key, recent);
    return { success: false, driver: 'memory' };
  }

  recent.push(now);
  hits.set(key, recent);
  return { success: true, driver: 'memory' };
}

/** Clears the in-memory window. Test helper only. */
export function resetMemoryRateLimit(): void {
  hits.clear();
}

function getBinding(): RateLimit | null {
  try {
    const { env } = getCloudflareContext();
    return env.RATE_LIMITER ?? null;
  } catch {
    return null;
  }
}

/**
 * Checks one key (for example `rsvp:<ipHash>`) against the limiter.
 * Never throws: on any error the request is allowed through, because a broken
 * limiter must not take the RSVP form down.
 */
export async function checkRateLimit(
  key: string,
  options: MemoryLimitOptions = DEFAULT_MEMORY_OPTIONS,
): Promise<RateLimitResult> {
  const binding = getBinding();

  if (binding) {
    try {
      const outcome = await binding.limit({ key });
      return { success: outcome.success, driver: 'binding' };
    } catch {
      // fall through to the memory limiter
    }
  }

  return memoryRateLimit(key, options);
}

/**
 * Hashes a client IP with a salt, so raw addresses are never stored.
 * Returns a short hex digest.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
