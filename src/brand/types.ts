import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/config';

/**
 * A brand identity, as described in `docs/marque-et-domaines.md` (section 5):
 * three complete, deliberately different presets a couple of lines in
 * `src/brand.ts` can switch between via the `BRAND_ID` environment variable.
 */
export const BRAND_IDS = ['unfurl', 'kraft-and-bloom', 'petal-post'] as const;

export type BrandId = (typeof BRAND_IDS)[number];

export function isBrandId(value: unknown): value is BrandId {
  return typeof value === 'string' && (BRAND_IDS as readonly string[]).includes(value);
}

/**
 * The neutral colour tokens a brand exposes, injected as `--brand-*` CSS
 * custom properties on the application shell only (never on `/[slug]` or
 * `/demo/*`, which are styled entirely by the invitation theme).
 */
export interface BrandPalette {
  /** Page background. */
  bg: string;
  /** Slightly offset background, for cards and the header/footer hairline. */
  bgAlt: string;
  /** Body text / dark surfaces. */
  fg: string;
  /** Muted text, borders, secondary neutral. */
  muted: string;
  /** Primary accent (buttons, links, focus ring). */
  accent: string;
  /** Secondary accent. Defaults to `accent` for a preset that names only one. */
  accent2?: string;
  /** Text colour to use on top of `accent`. */
  onAccent: string;
}

export interface BrandFonts {
  /** CSS `font-family` stack for headings and the logotype. */
  heading: string;
  /** CSS `font-family` stack for interface and body copy. */
  body: string;
  /** CSS `font-family` stack for the handwritten accent, when the preset has one. */
  script?: string;
}

/** Renders the brand mark. `variant="mark"` is the monogram alone (used as the favicon base); `"full"` pairs it with the wordmark. */
export type BrandLogoComponent = ComponentType<{
  variant?: 'mark' | 'full';
  className?: string;
  /** Pixel size of the square mark (the wordmark scales with it). Default 32. */
  size?: number;
}>;

export interface BrandPreset {
  id: BrandId;
  /** Full brand name, as used in the wordmark and legal mentions. */
  name: string;
  tagline: Record<Locale, string>;
  /** Longer variant of the tagline, used in the hero subtitle. */
  taglineLong: Record<Locale, string>;
  /** One line describing the tone of voice, for the docs and for copy review — not shown to visitors. */
  voiceNote: string;
  palette: BrandPalette;
  fonts: BrandFonts;
  /** Raw, single-colour SVG markup for the favicon (uses `currentColor`-free literal colours so it renders correctly everywhere it is copied). */
  faviconSvg: string;
  Logo: BrandLogoComponent;
}
