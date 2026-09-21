import type { CSSProperties } from 'react';
import { preset as kraftAndBloom } from './brand/presets/kraft-and-bloom';
import { preset as petalPost } from './brand/presets/petal-post';
import { preset as unfurl } from './brand/presets/unfurl';
import { isBrandId, type BrandId, type BrandPreset } from './brand/types';

export { BRAND_IDS, isBrandId } from './brand/types';
export type { BrandId, BrandFonts, BrandPalette, BrandPreset } from './brand/types';

/**
 * The three brand identities of `docs/marque-et-domaines.md` (section 5).
 * `kraft-and-bloom` is the document's recommendation and the default.
 */
export const BRAND_PRESETS: Record<BrandId, BrandPreset> = {
  unfurl,
  'kraft-and-bloom': kraftAndBloom,
  'petal-post': petalPost,
};

function resolveBrandId(): BrandId {
  const raw = process.env.BRAND_ID?.trim();
  if (raw && isBrandId(raw)) return raw;
  return 'kraft-and-bloom';
}

export interface Brand extends BrandPreset {
  /** Etsy shop URL. Placeholder until the shop is named and opened (see `docs/marque-et-domaines.md`, section 5). */
  etsyShopUrl: string;
  /** Support contact shown on the site. Falls back to the legal contact address, then a visible placeholder. */
  supportEmail: string;
}

/**
 * The active brand, selected once per deployment by the `BRAND_ID`
 * environment variable (`unfurl` | `kraft-and-bloom` | `petal-post`,
 * default `kraft-and-bloom`). Everything the marketing site and the
 * application shell render — name, tagline, palette, fonts, logo, favicon —
 * comes from this single object.
 */
export const brand: Brand = {
  ...BRAND_PRESETS[resolveBrandId()],
  etsyShopUrl:
    process.env.BRAND_ETSY_SHOP_URL?.trim() || 'https://www.etsy.com/shop/REPLACE_WITH_SHOP_NAME',
  supportEmail:
    process.env.BRAND_SUPPORT_EMAIL?.trim() ||
    process.env.LEGAL_CONTACT_EMAIL?.trim() ||
    '[[SUPPORT_EMAIL]]',
};

/**
 * Inline CSS custom properties for the `--brand-*` tokens, meant for the
 * application shell wrapper only (see `src/app/(app)/layout.tsx`). Never
 * applied to `/[slug]` or `/demo/*`, which carry their own theme tokens.
 */
export function brandStyleVars(preset: BrandPreset = brand): CSSProperties {
  const { palette, fonts } = preset;
  return {
    '--brand-bg': palette.bg,
    '--brand-bg-alt': palette.bgAlt,
    '--brand-fg': palette.fg,
    '--brand-muted': palette.muted,
    '--brand-accent': palette.accent,
    '--brand-accent-2': palette.accent2 ?? palette.accent,
    '--brand-on-accent': palette.onAccent,
    '--brand-font-heading': fonts.heading,
    '--brand-font-body': fonts.body,
    '--brand-font-script': fonts.script ?? fonts.heading,
  } as CSSProperties;
}
