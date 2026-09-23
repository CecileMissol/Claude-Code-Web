/**
 * Theme seeding.
 *
 * `invitations.theme_id` is a foreign key to the `themes` table, while the
 * renderer only knows a theme by its folder name (`themes.slug`). The registry
 * in `src/themes/registry.ts` is the source of truth, so the rows of `themes`
 * are derived from the manifests rather than written by hand.
 *
 * This module is the single seeding mechanism (phase 8: `src/db/seed-themes.ts`
 * and its random ids are gone). Three entry points, one truth:
 * - {@link seedThemes} — used by the application (the editor creates a draft,
 *   the Etsy activation creates one too), by `/admin` and `/activate` through
 *   {@link ensureThemesSeeded}, and by the tests;
 * - {@link themeSeedSql} — used by `pnpm db:seed:local`, which pipes plain SQL
 *   through `wrangler d1 execute`;
 * - {@link themeSeedId} — the deterministic primary key `theme-<slug>`, so the
 *   CLI, the application and the tests all write the same row.
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
  const { loadAllManifests } = await import('@/themes/manifests');
  return (await loadAllManifests()).map(themeSeedRow);
}

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Idempotent SQL for the given rows: insert, or refresh name and version.
 * `status` is only written on insert: an operator may have deliberately drafted
 * or archived a theme in the database, and a re-seed must not undo that.
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
        'version = excluded.version;',
    )
    .join('\n');
}

/**
 * Inserts or refreshes every registered theme. Idempotent: a second run leaves
 * the table exactly as the first one did, and never changes a theme's id.
 *
 * `name` and `version` are refreshed when the manifest has moved on; `status`
 * is written on insert only, because an operator may have deliberately drafted
 * or archived a theme in the database.
 *
 * @param rows Rows to write; defaults to every manifest of the registry.
 * @returns The rows as they now stand in the table (`id` is the stored one,
 *   which may predate the deterministic ids for a database seeded long ago).
 */
export async function seedThemes(
  db: Database,
  rows?: readonly ThemeSeedRow[],
): Promise<ThemeSeedRow[]> {
  const { eq } = await import('drizzle-orm');
  const { themes } = await import('./schema');
  const values = rows ? [...rows] : await loadThemeSeedRows();
  const written: ThemeSeedRow[] = [];

  for (const row of values) {
    const found = (await db.select().from(themes).where(eq(themes.slug, row.slug)).limit(1))[0];

    if (!found) {
      try {
        await db.insert(themes).values({ ...row, createdAt: new Date() });
        written.push(row);
      } catch {
        // Lost a race with a concurrent seed: re-read rather than fail. The
        // unique index on `slug` guarantees there is exactly one row now.
        const raced = (await db.select().from(themes).where(eq(themes.slug, row.slug)).limit(1))[0];
        written.push(raced ? { ...row, id: raced.id, status: raced.status } : row);
      }
      continue;
    }

    if (found.name !== row.name || found.version !== row.version) {
      await db
        .update(themes)
        .set({ name: row.name, version: row.version })
        .where(eq(themes.slug, row.slug));
    }

    written.push({ ...row, id: found.id, status: found.status });
  }

  return written;
}

/**
 * Seeds every registered theme, without caring about the rows.
 * Called on `/admin` and `/activate` so a fresh database is never empty.
 */
export async function ensureThemesSeeded(db: Database): Promise<void> {
  await seedThemes(db);
}

/** Theme id for a slug, seeding the table first when the theme is missing. */
export async function getThemeIdBySlug(db: Database, slug: string): Promise<string | null> {
  const { eq } = await import('drizzle-orm');
  const { themes } = await import('./schema');

  const found = await db
    .select({ id: themes.id })
    .from(themes)
    .where(eq(themes.slug, slug))
    .limit(1);
  if (found[0]) return found[0].id;

  const seeded = await seedThemes(db);
  return seeded.find((candidate) => candidate.slug === slug)?.id ?? null;
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
