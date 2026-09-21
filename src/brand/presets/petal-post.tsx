import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/work-sans/wght.css';
import '@fontsource/caveat/latin-600.css';
import type { BrandLogoComponent, BrandPreset } from '../types';

/**
 * Preset C — "Petal Post", moderne & joueuse
 * (`docs/marque-et-domaines.md`, section 5.C).
 *
 * Kept in reserve for a future, younger sub-brand or second event type
 * (see the recommendation closing section 5) rather than the wedding launch,
 * but fully usable via `BRAND_ID=petal-post`.
 */

const HEADING = "'Bricolage Grotesque Variable', 'Bricolage Grotesque', system-ui, sans-serif";
const BODY = "'Work Sans Variable', 'Work Sans', -apple-system, 'Segoe UI', sans-serif";
const SCRIPT = "'Caveat', 'Segoe Script', cursive";

/**
 * Monogram: a circular sticker/postmark badge in bold rounded letters, with
 * a small peeled corner — a nod to an envelope without drawing one.
 */
export const Logo: BrandLogoComponent = ({ variant = 'full', className, size = 32 }) => {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={variant === 'mark' ? 'img' : undefined}
      aria-label={variant === 'mark' ? 'Petal Post' : undefined}
      aria-hidden={variant === 'full' ? true : undefined}
    >
      <circle cx="24" cy="24" r="21.5" fill="currentColor" />
      {/* Peeled corner. */}
      <path d="M38 10 L44 10 L44 16 C40 16 38 13.5 38 10Z" fill="var(--brand-bg, #FFFDF9)" />
      <text
        x="24"
        y="30.5"
        textAnchor="middle"
        fontSize="18"
        fontWeight={700}
        fill="var(--brand-bg, #FFFDF9)"
        style={{ fontFamily: HEADING }}
      >
        PP
      </text>
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className}>{mark}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      {mark}
      <span style={{ fontFamily: HEADING, fontWeight: 600 }} className="text-lg">
        Petal Post
      </span>
    </span>
  );
};

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21.5" fill="#FF6B57"/><path d="M38 10 L44 10 L44 16 C40 16 38 13.5 38 10Z" fill="#FFFDF9"/><text x="24" y="30.5" text-anchor="middle" font-size="18" font-weight="700" fill="#FFFDF9" font-family="Arial, Helvetica, sans-serif">PP</text></svg>`;

export const preset: BrandPreset = {
  id: 'petal-post',
  name: 'Petal Post',
  tagline: {
    en: 'Your love story, delivered.',
    fr: 'Votre histoire d’amour, livrée avec le sourire.',
  },
  taglineLong: {
    en: 'An invitation that opens like a real letter — your love story, delivered.',
    fr: 'Une invitation qui s’ouvre comme une vraie lettre — votre histoire d’amour, livrée avec le sourire.',
  },
  voiceNote:
    'Upbeat and playful, short sentences, exclamation marks welcome, a tone closer to social media than classic stationery.',
  palette: {
    bg: '#FFFDF9',
    bgAlt: '#FFF3EE',
    fg: '#1B2340',
    muted: '#A6ABC4',
    accent: '#FF6B57',
    accent2: '#FFC845',
    onAccent: '#FFFDF9',
  },
  fonts: { heading: HEADING, body: BODY, script: SCRIPT },
  faviconSvg: FAVICON_SVG,
  Logo,
};
