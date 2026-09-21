import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { schema } from './schema';

export type Database = DrizzleD1Database<typeof schema>;

/** Wraps any D1 binding (production, `wrangler dev`, or a test double). */
export function createDb(binding: D1Database): Database {
  return drizzle(binding, { schema });
}

/**
 * Database handle for the current request, built from the `DB` binding
 * declared in wrangler.jsonc. In `next dev`, `initOpenNextCloudflareForDev()`
 * (see next.config.ts) makes the local bindings available here too.
 */
export function getDb(): Database {
  const { env } = getCloudflareContext();
  if (!env.DB) {
    throw new Error('Missing D1 binding "DB". Check wrangler.jsonc and run `pnpm cf-typegen`.');
  }
  return createDb(env.DB);
}

/** Async variant, for the places where the context is only available async. */
export async function getDbAsync(): Promise<Database> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) {
    throw new Error('Missing D1 binding "DB". Check wrangler.jsonc and run `pnpm cf-typegen`.');
  }
  return createDb(env.DB);
}

export { schema };
export * from './schema';
