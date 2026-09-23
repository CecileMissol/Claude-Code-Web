import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Do not write AGENTS.md / CLAUDE.md into the repository.
  agentRules: false,
  // Photos are resized client-side before upload and served straight from R2,
  // so the built-in optimizer (unavailable on Workers) is not needed.
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);

// Gives `getCloudflareContext()` access to the local bindings declared in
// wrangler.jsonc while running `next dev`.
void (async () => {
  if (process.env.NODE_ENV === 'development') {
    const { initOpenNextCloudflareForDev } = await import('@opennextjs/cloudflare');
    await initOpenNextCloudflareForDev();
  }
})();
