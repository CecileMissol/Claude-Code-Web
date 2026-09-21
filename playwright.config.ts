import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * The browser is the one already installed in the image; `playwright install`
 * is never run (no network beyond the npm registry).
 *
 * Three viewports, matching the sizes the invitation must be validated at:
 * mobile 390 px, tablet 768 px, desktop 1440 px.
 */

const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    launchOptions: { executablePath: CHROMIUM },
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
        command: `pnpm exec next start --port ${PORT}`,
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
        env: {
          BETTER_AUTH_SECRET:
            process.env.BETTER_AUTH_SECRET ?? 'dev-only-insecure-secret-change-me',
        },
      },
});
