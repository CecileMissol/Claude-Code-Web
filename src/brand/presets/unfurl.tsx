import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter/wght.css';
import type { BrandLogoComponent, BrandPreset } from '../types';

/**
 * Preset A — "Unfurl", chic & épurée (`docs/marque-et-domaines.md`, section 5.A).
 *
 * Sober, editorial tone. Kept in reserve for a future premium / direct-sale
 * positioning rather than the Etsy launch (see the recommendation at the end
 * of section 5), but fully usable via `BRAND_ID=unfurl`.
 */

const HEADING = "'Fraunces Variable', 'Fraunces', Georgia, 'Times New Roman', serif";
const BODY = "'Inter Variable', 'Inter', -apple-system, 'Segoe UI', sans-serif";

/**
 * Monogram: one continuous stroke forming a minimal "U" whose end curls into
 * a small spiral — half envelope flap lifting, half petal unfurling. No
 * fill, a single `currentColor` stroke, legible down to a 16 px favicon.
 */
const MARK_PATH =
  'M14 8 C8 8 6 16 6 22 C6 33 14 41 25 41 C35 41 42 34 42 24 C42 17 37 12 31 10.5 C27.5 9.5 24 11 23.5 15 C23.1 18 25.5 20 28.5 19.2 C30.3 18.7 31.3 16.8 30.4 15';

export const Logo: BrandLogoComponent = ({ variant = 'full', className, size = 32 }) => {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={variant === 'mark' ? 'img' : undefined}
      aria-label={variant === 'mark' ? 'Unfurl' : undefined}
      aria-hidden={variant === 'full' ? true : undefined}
    >
      <path
        d={MARK_PATH}
        stroke="currentColor"
        strokeWidth={4.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className}>{mark}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      {mark}
      <span
        style={{ fontFamily: HEADING, fontStyle: 'italic', letterSpacing: '0.02em' }}
        className="text-lg font-medium"
      >
        unfurl
      </span>
    </span>
  );
};

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#FAF9F6"/><path d="${MARK_PATH}" stroke="#2B2A28" stroke-width="4.25" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

export const preset: BrandPreset = {
  id: 'unfurl',
  name: 'Unfurl',
  tagline: {
    en: 'Unfurl your story.',
    fr: 'Dépliez votre histoire.',
  },
  taglineLong: {
    en: 'An invitation that opens like a real letter.',
    fr: 'Une invitation qui s’ouvre comme une vraie lettre.',
  },
  voiceNote:
    'Sober and editorial: short sentences, no exclamation marks, no superlatives — show, don’t tell.',
  palette: {
    bg: '#FAF9F6',
    bgAlt: '#F1EEE7',
    fg: '#2B2A28',
    muted: '#B9AFA0',
    accent: '#A98B4E',
    accent2: '#8A7140',
    onAccent: '#FAF9F6',
  },
  fonts: { heading: HEADING, body: BODY },
  faviconSvg: FAVICON_SVG,
  Logo,
};
