import { brand } from '@/brand';

/**
 * Dynamic favicon: serves the active brand's `faviconSvg` (see `src/brand.ts`
 * and `src/brand/presets/*`). A static copy of each preset's favicon also
 * lives under `public/brand/<id>/favicon.svg` for reuse outside the app
 * (Etsy listing assets, the activation PDF).
 */
export const size = { width: 48, height: 48 };
export const contentType = 'image/svg+xml';

export default function Icon() {
  return new Response(brand.faviconSvg, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
  });
}
