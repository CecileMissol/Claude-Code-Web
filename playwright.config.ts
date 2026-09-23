import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * The browser is the one already installed in the image; `playwright install`
 * is never run here (no network beyond the npm registry). Where that browser
 * does not exist — in CI, where the workflow runs `playwright install
 * --with-deps chromium` — Playwright falls back on the one it manages itself.
 *
 * Three viewports, matching the sizes the invitation must be validated at:
 * mobile 390 px, tablet 768 px, desktop 1440 px.
 *
 * ## The server
 *
 * `pnpm test:e2e` starts **`next dev`**, not `next start`: only the development
 * server goes through `initOpenNextCloudflareForDev()` (see `next.config.ts`),
 * which is what provides the local D1, R2 and KV bindings. Without them the
 * editor, the RSVP journey and the activation have no database at all — which
 * is why those specs used to be skipped.
 *
 * Three details that are not free choices:
 *
 * - **`localhost`, never `127.0.0.1`.** Better Auth checks the request origin
 *   against `APP_URL`; a mismatch between the two spellings has the client
 *   bundle refuse to bootstrap, and the pages then never hydrate.
 * - **`workers: 1`.** The fixtures are written by `wrangler d1 execute --local`,
 *   a second process on the same SQLite file; Miniflare's local D1 returns
 *   internal errors as soon as two of them write at once.
 * - **`pretest:e2e`** (see `package.json`) applies the migrations and seeds the
 *   themes before any of this starts, so the database the server opens is ready.
 *
 * `PLAYWRIGHT_BASE_URL` still points the run at a server that is already up.
 */

const PORT = Number(process.env.PORT ?? 3110);
/** Better Auth compares the origin with `APP_URL`: one spelling, everywhere. */
const HOST = 'localhost';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${HOST}:${PORT}`;
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {};

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: false,
  // Local D1 (SQLite through Miniflare) breaks on concurrent writes.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    launchOptions,
  },

  projects: [
    {
      name: 'mobile-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: false },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next dev --hostname ${HOST} --port ${PORT}`,
        url: BASE_URL,
        // A cold Turbopack start compiles the first routes on demand.
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          PORT: String(PORT),
          // Better Auth signs its links and checks origins against this.
          APP_URL: BASE_URL,
          BETTER_AUTH_SECRET:
            process.env.BETTER_AUTH_SECRET ?? 'dev-only-insecure-secret-change-me',
          // `tests/e2e/activation.spec.ts` expects `/admin` to exist, and the
          // editor journey creates its own draft from `/app`.
          ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? 'admin@example.com',
          ALLOW_FREE_DRAFTS: 'true',
          MAIL_DRIVER: 'console',
        },
      },
});
