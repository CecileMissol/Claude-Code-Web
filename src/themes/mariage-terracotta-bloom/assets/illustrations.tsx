/**
 * Inline SVG placeholders of the "Terracotta Bloom" theme.
 *
 * Every illustration is drawn with `var(--stem)`, `var(--accent)`,
 * `var(--seal)` or `currentColor` so the couple's palette repaints it without a
 * second file — that is the selling point of the product versus a Canva
 * template (BRIEF §7.4).
 *
 * These are *placeholders*: proportions, viewBoxes and colourable parts match
 * exactly what the illustrator must deliver (see `assets/README.md`). Swapping
 * a placeholder for the real asset means replacing one component below.
 *
 * The botanicals are declared once in `<IllustrationDefs />` and referenced
 * with `<use>`, so a chapter that shows the same pampas plume four times ships
 * its path data once. Every generated shape comes from a seeded generator, so
 * the server and the browser draw byte-identical markup (no hydration
 * mismatch) and a bouquet never reshuffles between renders.
 */

export const PAMPAS_ID = 'tb-pampas';
export const BLOOM_ID = 'tb-bloom';
export const EUCALYPTUS_ID = 'tb-eucalyptus';
export const SUNARCH_ID = 'tb-sunarch';

/** Deterministic Lehmer generator — same sequence on the server and the client. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

/* -------------------------------------------------------------------------- */
/* Pampas grass — a feathery plume on a long dry stem                         */
/* -------------------------------------------------------------------------- */

interface Barb {
  d: string;
  width: number;
  opacity: number;
  tone: string;
}

const PLUME_TONES = ['#EFDCC2', '#E4CBAB', '#F6EADA', '#DDBE9B', '#EADAC0'] as const;

/**
 * The plume is a bundle of short curved barbs sprouting from a spine, fat in
 * the middle and tapering at both ends — which is what tells a pampas plume
 * from a feather duster.
 */
function buildPlume(count = 54): Barb[] {
  const random = seeded(11);
  const barbs: Barb[] = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    // Along the spine, from the tip (y = 6) down to the stem (y = 104).
    const y = 6 + t * 98;
    const x = 35 + Math.sin(t * 2.2) * 2;
    // Fat in the middle third.
    const spread = Math.sin(Math.PI * Math.min(1, t * 1.06)) ** 0.75;
    const side = i % 2 === 0 ? -1 : 1;
    const length = (11 + random() * 13) * spread + 2;
    const droop = 8 + random() * 12;

    barbs.push({
      d: `M${round(x)} ${round(y)} q${round(side * length * 0.55)} ${round(droop * 0.35)} ${round(
        side * length,
      )} ${round(droop)}`,
      width: round(0.9 + random() * 0.9, 2),
      opacity: round(0.55 + random() * 0.45, 2),
      tone: PLUME_TONES[Math.floor(random() * PLUME_TONES.length)] ?? '#EFDCC2',
    });
  }
  return barbs;
}

const PLUME = buildPlume();

/* -------------------------------------------------------------------------- */
/* Eucalyptus — round leaves alternating along a curved branch                */
/* -------------------------------------------------------------------------- */

interface Leaf {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  opacity: number;
}

function buildEucalyptus(count = 22): Leaf[] {
  const random = seeded(23);
  const leaves: Leaf[] = [];

  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    // Follows the branch: a gentle S from (45, 6) to (30, 200).
    const x = 45 - Math.sin(t * Math.PI * 0.9) * 16;
    const y = 6 + t * 194;
    const side = i % 2 === 0 ? -1 : 1;
    const size = 7 + random() * 4 + (1 - Math.abs(t - 0.45)) * 3;

    leaves.push({
      cx: round(x + side * (size * 0.95 + 3)),
      cy: round(y),
      rx: round(size),
      ry: round(size * 0.78),
      rotate: Math.round(side * (22 + random() * 26)),
      opacity: round(0.62 + random() * 0.38, 2),
    });
  }
  return leaves;
}

const EUCALYPTUS_LEAVES = buildEucalyptus();

/* -------------------------------------------------------------------------- */
/* Dried blooms — a small ranunculus cluster                                  */
/* -------------------------------------------------------------------------- */

interface Bloom {
  cx: number;
  cy: number;
  r: number;
  rotate: number;
  petals: number;
  tone: string;
}

const BLOOM_TONES = ['#F0D9C6', '#E6C0AB', '#F7EBDC', '#DDAF97', '#EDCDB6'] as const;

function buildBlooms(count = 9): Bloom[] {
  const random = seeded(31);
  const blooms: Bloom[] = [];

  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * 27;
    blooms.push({
      cx: round(52 + Math.cos(angle) * distance),
      cy: round(40 + Math.sin(angle) * distance * 0.82),
      r: round(7 + random() * 7, 2),
      rotate: Math.floor(random() * 60),
      petals: 6 + Math.floor(random() * 3),
      tone: BLOOM_TONES[Math.floor(random() * BLOOM_TONES.length)] ?? '#F0D9C6',
    });
  }
  // Painter's order: the big blooms sit in front.
  return blooms.sort((a, b) => a.r - b.r);
}

const BLOOMS = buildBlooms();

/** One ranunculus: concentric rings of rounded petals. */
function bloomPetals(bloom: Bloom) {
  const petals = [];
  for (let ring = 0; ring < 2; ring += 1) {
    const count = ring === 0 ? bloom.petals : Math.max(4, bloom.petals - 2);
    const radius = bloom.r * (ring === 0 ? 0.62 : 0.3);
    const size = bloom.r * (ring === 0 ? 0.44 : 0.3);
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.4;
      petals.push({
        key: `${ring}-${i}`,
        cx: round(Math.cos(angle) * radius, 2),
        cy: round(Math.sin(angle) * radius, 2),
        r: round(size, 2),
        opacity: ring === 0 ? 1 : 0.9,
      });
    }
  }
  return petals;
}

/* -------------------------------------------------------------------------- */
/* Shared <defs> block                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Hidden SVG holding every reusable symbol. Rendered once, at the top of the
 * invitation.
 */
export function IllustrationDefs() {
  return (
    <svg width="0" height="0" className="tb-defs" aria-hidden="true" focusable="false">
      {/* ---- Pampas plume ---- */}
      <symbol id={PAMPAS_ID} viewBox="0 0 70 220">
        <path
          d="M35 96 C33 140 32 176 38 216"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M34 140 C42 132 49 132 55 126 C48 126 40 130 34 140Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".7"
        />
        <g fill="none" strokeLinecap="round">
          {PLUME.map((barb, index) => (
            <path
              key={index}
              d={barb.d}
              stroke={barb.tone}
              strokeWidth={barb.width}
              opacity={barb.opacity}
            />
          ))}
        </g>
        <path
          d="M35 8 C33 40 33 70 35 104"
          fill="none"
          stroke="#E2CBAB"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </symbol>

      {/* ---- Dried ranunculus cluster ---- */}
      <symbol id={BLOOM_ID} viewBox="0 0 110 120">
        <path
          d="M54 62 C58 82 62 96 58 120"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="1.8"
        />
        <path
          d="M70 58 C78 74 84 90 82 118"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="1.5"
          opacity=".8"
        />
        <path
          d="M40 62 C36 78 38 96 32 116"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="1.4"
          opacity=".8"
        />
        <ellipse
          cx="22"
          cy="56"
          rx="17"
          ry="6.5"
          transform="rotate(-28 22 56)"
          style={{ fill: 'var(--stem)' }}
          opacity=".7"
        />
        <ellipse
          cx="88"
          cy="52"
          rx="16"
          ry="6"
          transform="rotate(26 88 52)"
          style={{ fill: 'var(--stem)' }}
          opacity=".55"
        />
        {BLOOMS.map((bloom, index) => (
          <g key={index} transform={`translate(${bloom.cx} ${bloom.cy}) rotate(${bloom.rotate})`}>
            {bloomPetals(bloom).map((petal) => (
              <circle
                key={petal.key}
                cx={petal.cx}
                cy={petal.cy}
                r={petal.r}
                fill={bloom.tone}
                opacity={petal.opacity}
                stroke="rgba(150,105,80,.28)"
                strokeWidth=".4"
              />
            ))}
            <circle r={round(bloom.r * 0.2, 2)} style={{ fill: 'var(--accent)' }} opacity=".75" />
          </g>
        ))}
      </symbol>

      {/* ---- Eucalyptus branch ---- */}
      <symbol id={EUCALYPTUS_ID} viewBox="0 0 90 210">
        <path
          d="M45 4 C33 60 27 130 30 206"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {EUCALYPTUS_LEAVES.map((leaf, index) => (
          <g key={index} transform={`translate(${leaf.cx} ${leaf.cy}) rotate(${leaf.rotate})`}>
            <ellipse
              rx={leaf.rx}
              ry={leaf.ry}
              style={{ fill: 'var(--stem)' }}
              opacity={leaf.opacity}
            />
            <path
              d={`M${-leaf.rx * 0.6} 0 H${leaf.rx * 0.6}`}
              stroke="rgba(255,255,255,.35)"
              strokeWidth=".7"
            />
          </g>
        ))}
      </symbol>

      {/* ---- Sun over an arch ---- */}
      <symbol id={SUNARCH_ID} viewBox="0 0 120 120">
        <g style={{ stroke: 'var(--accent)' }} strokeWidth="2.6" strokeLinecap="round" fill="none">
          {Array.from({ length: 12 }, (_, index) => {
            const angle = (index / 12) * Math.PI * 2;
            const inner = 34;
            const outer = 46;
            return (
              <line
                key={index}
                x1={round(60 + Math.cos(angle) * inner)}
                y1={round(56 + Math.sin(angle) * inner)}
                x2={round(60 + Math.cos(angle) * outer)}
                y2={round(56 + Math.sin(angle) * outer)}
                opacity={index % 2 === 0 ? 0.9 : 0.5}
              />
            );
          })}
        </g>
        <circle cx="60" cy="56" r="26" style={{ fill: 'var(--accent)' }} opacity=".92" />
        <path
          d="M40 104 V72 a20 20 0 0 1 40 0 v32"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </symbol>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Individual illustrations                                                   */
/* -------------------------------------------------------------------------- */

/** Pampas plume. Stem and leaf follow `--stem`, the plume stays warm sand. */
export function Pampas({ className, rotate }: { className?: string; rotate?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 70 220"
      aria-hidden="true"
      focusable="false"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <use href={`#${PAMPAS_ID}`} />
    </svg>
  );
}

/** Cluster of dried ranunculus. Stems follow `--stem`, hearts follow `--accent`. */
export function DriedBloom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 120" aria-hidden="true" focusable="false">
      <use href={`#${BLOOM_ID}`} />
    </svg>
  );
}

/** Eucalyptus branch. Entirely `--stem`. */
export function Eucalyptus({ className, rotate }: { className?: string; rotate?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 210"
      aria-hidden="true"
      focusable="false"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <use href={`#${EUCALYPTUS_ID}`} />
    </svg>
  );
}

/** Sun rising over a desert arch. `--accent` for the sun, `--stem` for the arch. */
export function SunArch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <use href={`#${SUNARCH_ID}`} />
    </svg>
  );
}

/**
 * Postmark: a sun-rayed cancel with the event date at the centre and three
 * wavy cancellation lines. `currentColor`, so the caller picks the ink.
 */
export function Postmark({ className, date }: { className?: string; date: string }) {
  const rays = Array.from({ length: 16 }, (_, index) => {
    const angle = (index / 16) * Math.PI * 2;
    return {
      x1: round(30 + Math.cos(angle) * 20),
      y1: round(30 + Math.sin(angle) * 20),
      x2: round(30 + Math.cos(angle) * 25),
      y2: round(30 + Math.sin(angle) * 25),
    };
  });

  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <circle cx="30" cy="30" r="19" />
        {rays.map((ray, index) => (
          <line key={index} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
        ))}
        <path d="M58 18 q9 -6 18 0 t18 0 t18 0" />
        <path d="M58 30 q9 -6 18 0 t18 0 t18 0" />
        <path d="M58 42 q9 -6 18 0 t18 0 t18 0" />
      </g>
      <text
        x="30"
        y="33"
        textAnchor="middle"
        fontSize="7"
        fill="currentColor"
        fontFamily="Georgia,serif"
        letterSpacing="0.8"
      >
        {date}
      </text>
    </svg>
  );
}

export type StampVariant = 'pampas' | 'eucalyptus' | 'sun';

/**
 * Illustrated stamp. The perforation is a CSS mask (see `styles.css`); the SVG
 * only carries the motif, which is why it is colourable by the palette.
 */
export function Stamp({
  className,
  variant = 'pampas',
  value,
}: {
  className?: string;
  variant?: StampVariant;
  value: string;
}) {
  return (
    <span className={`tb-stamp tb-stamp-${variant}${className ? ` ${className}` : ''}`}>
      <span className="tb-stamp-in">
        {variant === 'pampas' && <Pampas />}
        {variant === 'eucalyptus' && <Eucalyptus />}
        {variant === 'sun' && <SunArch />}
        <i>{value}</i>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Photo placeholders                                                         */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_VARIANTS = ['dunes', 'arch', 'cactus'] as const;
export type PlaceholderVariant = (typeof PLACEHOLDER_VARIANTS)[number];

/** Picks a stable placeholder scene from the slot id, so it never flickers. */
export function placeholderVariant(slotId: string): PlaceholderVariant {
  let hash = 0;
  for (let i = 0; i < slotId.length; i += 1) hash = (hash * 31 + slotId.charCodeAt(i)) % 997;
  return PLACEHOLDER_VARIANTS[hash % PLACEHOLDER_VARIANTS.length] ?? 'dunes';
}

/**
 * Stand-in for an empty photo slot: a warm desert scene in the theme's sepia
 * range, never a broken image. Drawn in SVG so it scales to any frame.
 */
export function PhotoPlaceholder({
  variant,
  className,
}: {
  variant: PlaceholderVariant;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 315"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="300" height="315" fill="#E7D2B8" />
      {variant === 'dunes' && (
        <>
          <circle cx="212" cy="80" r="30" fill="#F4E3CA" />
          <path d="M0 200 C60 168 120 186 180 200 C230 212 268 196 300 200 V315 H0Z" fill="#D3AE86" />
          <path d="M0 240 C80 214 160 232 300 226 V315 H0Z" fill="#BE9068" />
          <path d="M0 282 C90 268 190 274 300 276 V315 H0Z" fill="#A5774F" />
          <path
            d="M0 210 q40 -8 80 2 t80 4"
            fill="none"
            stroke="#E7CBA8"
            strokeWidth="2"
            opacity=".7"
          />
        </>
      )}
      {variant === 'arch' && (
        <>
          <rect width="300" height="315" fill="#EBD8BE" />
          <circle cx="96" cy="86" r="24" fill="#F6E8D2" />
          <path
            d="M40 315 V150 a110 110 0 0 1 220 0 V315 h-56 V150 a54 54 0 0 0 -108 0 V315Z"
            fill="#C68A5E"
          />
          <path d="M0 300 H300 V315 H0Z" fill="#A5774F" />
          <path d="M96 315 V182 a54 54 0 0 1 108 0 V315Z" fill="#E3C7A4" opacity=".75" />
        </>
      )}
      {variant === 'cactus' && (
        <>
          <rect width="300" height="315" fill="#EDDCC3" />
          <circle cx="234" cy="70" r="22" fill="#F7EAD5" />
          <path d="M0 248 C90 232 200 240 300 236 V315 H0Z" fill="#C79A70" />
          <g fill="#9BA97E">
            <rect x="126" y="120" width="34" height="140" rx="17" />
            <path d="M126 176 h-24 a14 14 0 0 0 -14 14 v20 a14 14 0 0 0 14 14 h24Z" />
            <path d="M160 156 h26 a14 14 0 0 1 14 14 v42 a14 14 0 0 1 -14 14 h-26Z" />
          </g>
          <g fill="#8A9770">
            <rect x="52" y="196" width="20" height="64" rx="10" />
            <rect x="226" y="184" width="22" height="76" rx="11" />
          </g>
          <path d="M0 292 H300 V315 H0Z" fill="#A97E56" />
        </>
      )}
    </svg>
  );
}

/**
 * Desert landscape used as the venue postcard when no photo is uploaded.
 * 3:2, like the `venue` slot.
 */
export function PostcardPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5DFC0" />
          <stop offset="1" stopColor="#E9BE95" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#tb-sky)" />
      <circle cx="222" cy="54" r="20" fill="#F6E7CF" />
      <path d="M0 122 C50 96 96 104 140 116 C190 130 244 104 300 112 V200 H0Z" fill="#CE9A6E" />
      <path d="M0 150 C80 132 160 142 300 140 V200 H0Z" fill="#B8814F" />
      <path
        d="M96 164 V108 a34 34 0 0 1 68 0 V164 h-18 V108 a16 16 0 0 0 -32 0 V164Z"
        fill="#9C6238"
      />
      <g fill="#8E9C72">
        <rect x="36" y="130" width="14" height="40" rx="7" />
        <path d="M36 142 h-10 a8 8 0 0 0 -8 8 v8 a8 8 0 0 0 8 8 h10Z" />
        <rect x="250" y="136" width="13" height="36" rx="6.5" />
      </g>
      <ellipse cx="200" cy="178" rx="34" ry="9" fill="#A9754A" opacity=".7" />
      <path d="M0 182 C100 172 200 176 300 178 V200 H0Z" fill="#A06A3E" />
    </svg>
  );
}
