import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit only generates the SQL here; migrations are applied by
 * `wrangler d1 migrations apply invitations-db`, which reads the same folder
 * (`migrations_dir` in wrangler.jsonc).
 */
export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  schema: './src/db/schema.ts',
  out: './drizzle',
  verbose: true,
  strict: true,
});
