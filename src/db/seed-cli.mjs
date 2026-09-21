/**
 * `pnpm db:seed:local` — inserts every registered theme into the local D1
 * database (idempotent, upsert on `themes.slug`).
 *
 * Plain JavaScript on purpose: it runs with bare `node`, which strips the types
 * of the `.ts` files it imports (Node >= 22.18) but resolves neither the `@/`
 * alias nor extension-less specifiers. Only modules whose runtime imports are
 * absent or explicit are loaded here: `manifests.ts` (its only import is a type
 * import) and each `manifest.ts` (pure data).
 *
 * The rows are written through `wrangler d1 execute --local`, the same tool
 * that applies the migrations.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

const { THEME_SLUGS } = await import(path.join(here, '../themes/manifests.ts'));
const { themeSeedRow, themeSeedSql } = await import(path.join(here, './seed.ts'));

const rows = [];
for (const slug of THEME_SLUGS) {
  const loaded = await import(path.join(here, `../themes/${slug}/manifest.ts`));
  rows.push(themeSeedRow(loaded.manifest ?? loaded.default));
}

const sql = themeSeedSql(rows);
console.info(`Seeding ${rows.length} theme(s) into the local D1 database:`);
for (const row of rows) console.info(`  · ${row.slug} (${row.name}, v${row.version})`);

const result = spawnSync(
  'pnpm',
  ['exec', 'wrangler', 'd1', 'execute', 'invitations-db', '--local', '--command', sql],
  { stdio: 'inherit', cwd: path.join(here, '../..') },
);

process.exit(result.status ?? 1);
