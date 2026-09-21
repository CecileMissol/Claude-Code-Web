import '@fontsource-variable/lora/wght.css';
import '@fontsource-variable/karla/wght.css';
import '@fontsource/caveat/latin-600.css';
import type { BrandLogoComponent, BrandPreset } from '../types';

/**
 * Preset B — "Kraft & Bloom", chaleureuse & artisanale
 * (`docs/marque-et-domaines.md`, section 5.B).
 *
 * **Default and recommended preset** (see the recommendation closing
 * section 5): closest to the buying behaviour already observed on Etsy for
 * this category.
 */

const HEADING = "'Lora Variable', 'Lora', Georgia, 'Times New Roman', serif";
const BODY = "'Karla Variable', 'Karla', -apple-system, 'Segoe UI', sans-serif";
const SCRIPT = "'Caveat', 'Segoe Script', cursive";

/**
 * Monogram: a round badge with a slightly torn paper edge (12-point blob,
 * not a perfect circle) standing in for a stamp/label, with a "K&B"
 * ligature reversed out of it — evokes a wax seal without drawing one
 * literally, so it stays usable even for a future theme without a seal.
 */
const BADGE_PATH =
  'M24 2.5c5.6 0 8.7 1 12.6 3.4 3.9 2.4 6.6 4.9 8 9.4 1.4 4.4 1.4 7.9-0.3 12.4-1.7 4.4-4 7.5-8.2 10.1-4.2 2.6-7.5 3.7-12.1 3.7-4.6 0-8.2-1.1-12.3-3.6-4-2.5-6.6-5.6-8.2-10.1-1.6-4.4-1.6-8 0-12.3 1.6-4.3 4.2-7 8-9.5C15.5 3.5 18.6 2.5 24 2.5z';

export const Logo: BrandLogoComponent = ({ variant = 'full', className, size = 32 }) => {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={variant === 'mark' ? 'img' : undefined}
      aria-label={variant === 'mark' ? 'Kraft & Bloom' : undefined}
      aria-hidden={variant === 'full' ? true : undefined}
    >
      <path d={BADGE_PATH} fill="currentColor" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="15"
        fontWeight={600}
        fill="var(--brand-bg, #F7EFE1)"
        style={{ fontFamily: HEADING }}
      >
        K
        <tspan style={{ fontFamily: SCRIPT }} fontSize="17">
          &amp;
        </tspan>
        B
      </text>
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className}>{mark}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      {mark}
      <span style={{ fontFamily: HEADING }} className="text-lg font-medium">
        Kraft <span style={{ fontFamily: SCRIPT, fontSize: '1.15em' }}>&amp;</span> Bloom
      </span>
    </span>
  );
};

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="${BADGE_PATH}" fill="#C1633D"/><text x="24" y="29" text-anchor="middle" font-size="15" font-weight="600" fill="#F7EFE1" font-family="Georgia, 'Times New Roman', serif">K&amp;B</text></svg>`;

export const preset: BrandPreset = {
  id: 'kraft-and-bloom',
  name: 'Kraft & Bloom',
  tagline: {
    en: 'Made to be opened by hand.',
    fr: 'Faite pour être ouverte à la main.',
  },
  taglineLong: {
    en: 'An invitation that opens like a real letter, made to be opened by hand.',
    fr: 'Une invitation qui s’ouvre comme une vraie lettre, faite pour être ouverte à la main.',
  },
  voiceNote:
    'Warm, tactile and a little chatty, like a friend who is good at paper crafts — we tell small stories rather than list features.',
  palette: {
    bg: '#F7EFE1',
    bgAlt: '#F0E4CF',
    fg: '#3B2E26',
    muted: '#B79E85',
    accent: '#C1633D',
    accent2: '#D9A441',
    onAccent: '#F7EFE1',
  },
  fonts: { heading: HEADING, body: BODY, script: SCRIPT },
  faviconSvg: FAVICON_SVG,
  Logo,
};
