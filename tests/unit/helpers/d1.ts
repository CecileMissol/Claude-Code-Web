import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Minimal in-memory D1 double backed by `node:sqlite`.
 *
 * `@cloudflare/vitest-pool-workers` currently pins `vitest@^4.1`, while the
 * repository runs Vitest 5, so the workerd pool is not usable here. Instead the
 * queries run against real SQLite, through the real `drizzle-orm/d1` driver,
 * with the very same migration files `wrangler d1 migrations apply` executes —
 * which is what the tests need to prove.
 *
 * It implements only the surface `drizzle-orm/d1` uses: prepare/bind/run/all/
 * raw and batch.
 */

const MIGRATIONS_DIR = path.join(process.cwd(), 'drizzle');

type Params = readonly unknown[];

function toSqliteValue(value: unknown): null | number | bigint | string | Uint8Array {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return Math.floor(value.getTime() / 1000);
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'string') {
    return value;
  }
  if (value instanceof Uint8Array) return value;
  return JSON.stringify(value);
}

function plain(row: Record<string, unknown>): Record<string, unknown> {
  return { ...row };
}

/** Reads every generated migration, in filename order. */
export function readMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .flatMap((file) =>
      readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0),
    );
}

export interface TestD1 {
  binding: D1Database;
  close: () => void;
}

/** Creates an in-memory database with every migration already applied. */
export function createTestD1(): TestD1 {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  for (const statement of readMigrations()) sqlite.exec(statement);

  function makeStatement(sql: string, params: Params = []) {
    const statement = {
      bind: (...values: unknown[]) => makeStatement(sql, values),
      async all() {
        const prepared = sqlite.prepare(sql);
        const bound = params.map(toSqliteValue);
        if (prepared.sourceSQL.trim().length === 0) return { results: [], success: true, meta: {} };
        try {
          const results = prepared.all(...bound) as Record<string, unknown>[];
          return { results: results.map(plain), success: true, meta: {} };
        } catch (error) {
          if (isNoResultError(error)) {
            prepared.run(...bound);
            return { results: [], success: true, meta: {} };
          }
          throw error;
        }
      },
      async run() {
        const prepared = sqlite.prepare(sql);
        const bound = params.map(toSqliteValue);
        try {
          const results = prepared.all(...bound) as Record<string, unknown>[];
          return { results: results.map(plain), success: true, meta: {} };
        } catch (error) {
          if (!isNoResultError(error)) throw error;
          const info = prepared.run(...bound);
          return {
            results: [],
            success: true,
            meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
          };
        }
      },
      async raw() {
        const prepared = sqlite.prepare(sql);
        prepared.setReturnArrays?.(true);
        return prepared.all(...params.map(toSqliteValue)) as unknown as unknown[][];
      },
    };
    return statement;
  }

  const binding = {
    prepare: (sql: string) => makeStatement(sql),
    async batch(statements: { run: () => Promise<unknown> }[]) {
      return Promise.all(statements.map((statement) => statement.run()));
    },
    async exec(sql: string) {
      sqlite.exec(sql);
      return { count: 0, duration: 0 };
    },
    dump: async () => new ArrayBuffer(0),
  } as unknown as D1Database;

  return { binding, close: () => sqlite.close() };
}

function isNoResultError(error: unknown): boolean {
  return error instanceof Error && /does not return|no result|not return data/i.test(error.message);
}
