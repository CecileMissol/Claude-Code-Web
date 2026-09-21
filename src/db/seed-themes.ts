import { eq } from 'drizzle-orm';
import type { Database } from './index';
import { themes } from './schema';
import { loadAllManifests } from '@/themes/registry';

/**
 * Idempotently inserts one `themes` row per theme registered in
 * `src/themes/registry.ts`. Safe to call on every `/admin` and `/activate`
 * page load: it only inserts rows that are missing, it never overwrites a
 * theme that already exists (an operator may have deliberately drafted or
 * archived it directly in the database), and running it twice concurrently is
 * harmless (the unique index on `themes.slug` makes a duplicate insert fail
 * silently — see the `catch` below — rather than corrupt anything).
 *
 * `src/db/seed.ts` (a separate CLI seed script, not owned by this file) is
 * expected to call this same function rather than duplicate its logic.
 */
export async function ensureThemesSeeded(db: Database): Promise<void> {
  const manifests = await loadAllManifests();

  for (const manifest of manifests) {
    const existing = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.slug, manifest.slug))
      .limit(1);
    if (existing.length > 0) continue;

    try {
      await db.insert(themes).values({
        id: crypto.randomUUID(),
        slug: manifest.slug,
        name: manifest.name.en,
        version: manifest.version,
        status: 'active',
      });
    } catch {
      // Lost a race with a concurrent call: the row exists now, which is all
      // this function promises.
    }
  }
}

/** Theme id for a given slug, seeding the table first if it is empty. */
export async function getThemeIdBySlug(db: Database, slug: string): Promise<string | null> {
  await ensureThemesSeeded(db);
  const rows = await db.select({ id: themes.id }).from(themes).where(eq(themes.slug, slug)).limit(1);
  return rows[0]?.id ?? null;
}
