/**
 * Theme seeding.
 *
 * `invitations.theme_id` is a foreign key to the `themes` table, while the
 * renderer only knows a theme by its folder name (`themes.slug`). The registry
 * in `src/themes/registry.ts` is the source of truth, so the rows of `themes`
 * are derived from the manifests rather than written by hand.
 *
 * Two entry points, one truth:
 * - {@link seedThemes} — used by the application (the editor creates a draft,
 *   the Etsy activation will create one too) and by the tests;
 * - {@link themeSeedSql} — used by `pnpm db:seed:local`, which pipes plain SQL
 *   through `wrangler d1 execute`.
 *
 * Every static import below is type-only and every runtime import is dynamic:
 * `src/db/seed-cli.mjs` loads this file with plain `node` (Node 22 strips the
 * types), and plain `node` resolves neither the `@/` alias nor an
 * extension-less specifier. The dynamic imports are never reached from the CLI.
 */

import type { ThemeManifest } from '@/themes/types';
import type { Database } from './index';
import type { ThemeStatus } from './schema';

export interface ThemeSeedRow {
  id: string;
  slug: string;
  /** English name; the interface reads the localised one from the manifest. */
  name: string;
  version: number;
  status: ThemeStatus;
}

/** Stable, human-readable primary key, so re-seeding never duplicates a theme. */
export function themeSeedId(slug: string): string {
  return `theme-${slug}`;
}

/** Turns a theme manifest into the row stored in `themes`. */
export function themeSeedRow(manifest: ThemeManifest): ThemeSeedRow {
  return {
    id: themeSeedId(manifest.slug),
    slug: manifest.slug,
    name: manifest.name.en,
    version: manifest.version,
    status: 'active',
  };
}

/** Every registered theme, as rows. */
export async function loadThemeSeedRows(): Promise<ThemeSeedRow[]> {
  const { loadAllManifests } = await import('@/themes/registry');
  return (await loadAllManifests()).map(themeSeedRow);
}

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Idempotent SQL for the given rows: insert, or refresh name/version/status.
 * Written by hand rather than through Drizzle because the CLI has no D1 binding.
 */
export function themeSeedSql(rows: readonly ThemeSeedRow[]): string {
  return rows
    .map(
      (row) =>
        'INSERT INTO themes (id, slug, name, version, status, created_at) VALUES (' +
        [quote(row.id), quote(row.slug), quote(row.name), row.version, quote(row.status)].join(
          ', ',
        ) +
        ', unixepoch()) ON CONFLICT(slug) DO UPDATE SET name = excluded.name, ' +
        'version = excluded.version, status = excluded.status;',
    )
    .join('\n');
}

/**
 * Inserts or refreshes every registered theme. Idempotent: a second run leaves
 * the table exactly as the first one did, and never changes a theme's id.
 *
 * @param rows Rows to write; defaults to every manifest of the registry.
 * @returns The rows that were written.
 */
export async function seedThemes(
  db: Database,
  rows?: readonly ThemeSeedRow[],
): Promise<ThemeSeedRow[]> {
  const { eq } = await import('drizzle-orm');
  const { themes } = await import('./schema');
  const values = rows ? [...rows] : await loadThemeSeedRows();

  for (const row of values) {
    const updated = await db
      .update(themes)
      .set({ name: row.name, version: row.version, status: row.status })
      .where(eq(themes.slug, row.slug))
      .returning();

    if (updated.length === 0) {
      await db.insert(themes).values({ ...row, createdAt: new Date() });
    }
  }

  return values;
}

/**
 * Returns the `themes` row for a slug, seeding the table when it is still
 * empty. The couple must never hit a foreign-key error because nobody ran the
 * seed script on a fresh database.
 *
 * @throws When the slug is not part of the theme registry.
 */
export async function ensureThemeSeeded(
  db: Database,
  slug: string,
): Promise<{ id: string; slug: string }> {
  const { eq } = await import('drizzle-orm');
  const { themes } = await import('./schema');

  const found = await db.select().from(themes).where(eq(themes.slug, slug)).limit(1);
  if (found[0]) return { id: found[0].id, slug: found[0].slug };

  const seeded = await seedThemes(db);
  const row = seeded.find((candidate) => candidate.slug === slug);
  if (!row)
    throw new Error(`Unknown theme "${slug}": it is not registered in src/themes/registry.ts.`);
  return { id: row.id, slug: row.slug };
}
