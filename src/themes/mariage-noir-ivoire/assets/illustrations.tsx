/**
 * Inline SVG placeholders of the "Noir & ivoire" theme.
 *
 * Every illustration is drawn with `var(--stem)`, `var(--accent)`,
 * `var(--seal)`, `var(--env)` or `currentColor` so the couple's palette repaints
 * it without a second file — that is the selling point of the product versus a
 * Canva template (BRIEF §7.4).
 *
 * These are *placeholders*: proportions, viewBoxes and colourable parts match
 * exactly what the illustrator must deliver (see `assets/README.md`). Swapping a
 * placeholder for the real asset means replacing one component below.
 *
 * The flower symbols are declared once in `<IllustrationDefs />` and referenced
 * with `<use>`, so a chapter that shows the same arum four times ships its path
 * data once.
 */

export const CALLA_ID = 'ni-calla';
export const BLOOM_ID = 'ni-bloom';
export const AMARANTH_ID = 'ni-amaranth';
export const POSTMARK_ID = 'ni-postmark';

/* -------------------------------------------------------------------------- */
/* Hydrangea — deterministic cluster of small blossoms                        */
/* -------------------------------------------------------------------------- */

interface Blossom {
  cx: number;
  cy: number;
  r: number;
  rotate: number;
  fill: string;
}

const BLOSSOM_FILLS = ['#FFFFFF', '#FBFBF4', '#F2F4E3', '#E7EBCF', '#FFFFFF'] as const;

/**
 * Builds the hydrangea cluster with a seeded Lehmer generator, so the server
 * and the browser draw byte-identical markup (no hydration mismatch) and the
 * bouquet never reshuffles between renders.
 */
function buildBlossoms(seed = 7, count = 62): Blossom[] {
  let state = seed;
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647;

  const blossoms: Blossom[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * 30;
    blossoms.push({
      cx: Number((50 + Math.cos(angle) * distance).toFixed(1)),
      cy: Number((38 + Math.sin(angle) * distance * 0.85).toFixed(1)),
      r: Number((3.4 + random() * 3.2).toFixed(2)),
      rotate: Math.floor(random() * 90),
      fill: BLOSSOM_FILLS[Math.floor(random() * BLOSSOM_FILLS.length)] ?? '#FFFFFF',
    });
  }
  return blossoms;
}

const BLOSSOMS = buildBlossoms();

const PETAL_OFFSETS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

/* -------------------------------------------------------------------------- */
/* Amaranth — drooping tassels                                                */
/* -------------------------------------------------------------------------- */

interface Tassel {
  spine: string;
  opacity: number;
  florets: { cx: number; cy: number; r: number }[];
}

/**
 * A tassel is a cubic curve plus a bottlebrush of florets sampled along it,
 * fattest in the middle and tapering to a point — which is what tells an
 * amaranth from a bamboo cane. Sampled once, at module load, from fixed
 * control points: the shape is identical on the server and in the browser.
 */
function buildTassel(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  width: number,
  steps: number,
  opacity: number,
): Tassel {
  const at = (t: number, i: 0 | 1) => {
    const u = 1 - t;
    return (
      u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
    );
  };

  const florets: Tassel['florets'] = [];
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    // Fat in the middle, pointed at both ends.
    const taper = Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.7;
    const radius = width * taper;
    if (radius < 0.35) continue;
    // Two florets per step, offset either side of the spine.
    const offset = radius * 0.5;
    florets.push({
      cx: Number((at(t, 0) - offset).toFixed(1)),
      cy: Number(at(t, 1).toFixed(1)),
      r: Number(radius.toFixed(2)),
    });
    florets.push({
      cx: Number((at(t, 0) + offset).toFixed(1)),
      cy: Number((at(t, 1) + radius * 0.45).toFixed(1)),
      r: Number((radius * 0.85).toFixed(2)),
    });
  }

  return {
    spine: `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`,
    opacity,
    florets,
  };
}

const AMARANTH_TASSELS: Tassel[] = [
  buildTassel([35, 92], [31, 120], [27, 150], [22, 190], 4.6, 26, 0.9),
  buildTassel([38, 96], [44, 126], [47, 158], [45, 208], 5.6, 30, 1),
  buildTassel([42, 88], [54, 114], [60, 142], [62, 178], 3.9, 22, 0.78),
];

/* -------------------------------------------------------------------------- */
/* Shared <defs> block                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Hidden SVG holding every reusable symbol. Rendered once, at the top of the
 * invitation.
 */
export function IllustrationDefs() {
  return (
    <svg width="0" height="0" className="ni-defs" aria-hidden="true" focusable="false">
      <symbol id={CALLA_ID} viewBox="0 0 60 200">
        <path
          d="M30 60 C27 110 24 150 33 198"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M31 120 C40 110 48 112 54 104 C46 104 38 108 31 120Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".85"
        />
        <path
          d="M30 63 C12 52 8 25 21 5 C26 18 39 22 52 16 C48 40 41 56 30 63Z"
          fill="#FDFCF8"
          stroke="#D9D5C8"
          strokeWidth="1"
        />
        <path d="M21 5 C29 20 33 38 30 62" fill="none" stroke="#E2DED2" strokeWidth="1" />
        <path
          d="M30 60 C29 48 31 37 34 29"
          stroke="#E0C255"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </symbol>

      <symbol id={BLOOM_ID} viewBox="0 0 100 110">
        <path
          d="M52 62 C58 80 64 92 60 110"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="1.6"
        />
        <path
          d="M66 58 C74 74 80 88 78 108"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="1.4"
          opacity=".8"
        />
        <path
          d="M40 60 C36 76 38 92 34 104"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="1.3"
          opacity=".8"
        />
        <ellipse
          cx="22"
          cy="54"
          rx="16"
          ry="6"
          transform="rotate(-30 22 54)"
          style={{ fill: 'var(--stem)' }}
          opacity=".7"
        />
        <ellipse
          cx="80"
          cy="50"
          rx="15"
          ry="5.5"
          transform="rotate(25 80 50)"
          style={{ fill: 'var(--stem)' }}
          opacity=".6"
        />
        {BLOSSOMS.map((blossom, index) => (
          <g
            key={index}
            transform={`translate(${blossom.cx} ${blossom.cy}) rotate(${blossom.rotate})`}
          >
            {PETAL_OFFSETS.map(([x, y], petal) => (
              <circle
                key={petal}
                cx={(x * blossom.r * 0.55).toFixed(1)}
                cy={(y * blossom.r * 0.55).toFixed(1)}
                r={(blossom.r * 0.62).toFixed(1)}
                fill={blossom.fill}
                stroke="rgba(120,125,100,.35)"
                strokeWidth=".4"
              />
            ))}
            <circle r={(blossom.r * 0.2).toFixed(1)} fill="#C8D08A" />
          </g>
        ))}
      </symbol>

      <symbol id={AMARANTH_ID} viewBox="0 0 80 220">
        {/* Main stem and two leaves. */}
        <path
          d="M40 4 C38 40 36 70 34 96"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M39 24 C28 22 20 28 14 36 C24 38 33 34 39 24Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".8"
        />
        <path
          d="M40 52 C52 50 60 56 66 64 C56 66 46 62 40 52Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".7"
        />
        {/* Three drooping tassels, each a bottlebrush of small florets. */}
        {AMARANTH_TASSELS.map((tassel, index) => (
          <g key={index} opacity={tassel.opacity}>
            <path
              d={tassel.spine}
              fill="none"
              style={{ stroke: 'var(--stem)' }}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {tassel.florets.map((floret, i) => (
              <circle
                key={i}
                cx={floret.cx}
                cy={floret.cy}
                r={floret.r}
                style={{ fill: 'var(--stem)' }}
              />
            ))}
          </g>
        ))}
      </symbol>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Individual illustrations                                                   */
/* -------------------------------------------------------------------------- */

/** Arum lily. Stem and leaf follow `--stem`. */
export function Calla({ className, rotate }: { className?: string; rotate?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 200"
      aria-hidden="true"
      focusable="false"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <use href={`#${CALLA_ID}`} />
    </svg>
  );
}

/** Hydrangea cluster. Stems and leaves follow `--stem`. */
export function Hydrangea({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 110" aria-hidden="true" focusable="false">
      <use href={`#${BLOOM_ID}`} />
    </svg>
  );
}

/** Drooping amaranth. Entirely `--stem`. */
export function Amaranth({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 220" aria-hidden="true" focusable="false">
      <use href={`#${AMARANTH_ID}`} />
    </svg>
  );
}

/**
 * Postmark: concentric rings plus cancellation waves, with the event date in
 * roman-month form at the centre. `currentColor`, so the caller picks the ink.
 */
export function Postmark({ className, date }: { className?: string; date: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="30" cy="30" r="24" />
        <circle cx="30" cy="30" r="18" />
        <path d="M58 16 q8 -5 16 0 t16 0 t16 0 t14 0" />
        <path d="M58 26 q8 -5 16 0 t16 0 t16 0 t14 0" />
        <path d="M58 36 q8 -5 16 0 t16 0 t16 0 t14 0" />
        <path d="M58 46 q8 -5 16 0 t16 0 t16 0 t14 0" />
      </g>
      <text
        x="30"
        y="33"
        textAnchor="middle"
        fontSize="7"
        fill="currentColor"
        fontFamily="Georgia,serif"
        letterSpacing="1"
      >
        {date}
      </text>
    </svg>
  );
}

/**
 * Perforated stamp. The dentelure is a CSS mask (see `styles.css`); the SVG
 * only carries the motif, which is why it is colourable by `--accent`.
 */
export function Stamp({
  className,
  variant = 'calla',
  value,
}: {
  className?: string;
  variant?: 'calla' | 'bloom';
  value: string;
}) {
  return (
    <span className={`stamp${variant === 'bloom' ? ' s2' : ''}${className ? ` ${className}` : ''}`}>
      <span className="in">
        {variant === 'calla' ? <Calla /> : <Hydrangea />}
        <i>{value}</i>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Photo placeholder                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_VARIANTS = ['sea', 'city', 'hills'] as const;
export type PlaceholderVariant = (typeof PLACEHOLDER_VARIANTS)[number];

/** Picks a stable placeholder scene from the slot id, so it never flickers. */
export function placeholderVariant(slotId: string): PlaceholderVariant {
  let hash = 0;
  for (let i = 0; i < slotId.length; i += 1) hash = (hash * 31 + slotId.charCodeAt(i)) % 997;
  return PLACEHOLDER_VARIANTS[hash % PLACEHOLDER_VARIANTS.length] ?? 'sea';
}

/**
 * Elegant stand-in for an empty photo slot: a monochrome engraved scene, never
 * a broken image. Drawn in SVG so it scales to any polaroid size.
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
      <rect width="300" height="315" fill="#d8d6d1" />
      {variant === 'sea' && (
        <>
          <circle cx="216" cy="82" r="26" fill="#f1f0ec" />
          <path d="M0 190 H300 V315 H0Z" fill="#8f8e8a" />
          <path
            d="M0 205 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0"
            fill="none"
            stroke="#b9b8b4"
            strokeWidth="3"
          />
          <path
            d="M0 232 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0"
            fill="none"
            stroke="#a8a7a3"
            strokeWidth="3"
          />
          <path
            d="M0 262 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0"
            fill="none"
            stroke="#9a9995"
            strokeWidth="3"
          />
          <path d="M120 190 L150 150 L180 190Z" fill="#6f6e6a" />
        </>
      )}
      {variant === 'city' && (
        <>
          <rect y="0" width="300" height="315" fill="#dededa" />
          <g fill="#7b7a76">
            <rect x="10" y="150" width="46" height="165" />
            <rect x="66" y="112" width="58" height="203" />
            <rect x="134" y="168" width="40" height="147" />
            <rect x="184" y="96" width="52" height="219" />
            <rect x="246" y="146" width="44" height="169" />
          </g>
          <g fill="#cfcecb" opacity=".8">
            <rect x="80" y="130" width="10" height="14" />
            <rect x="100" y="130" width="10" height="14" />
            <rect x="80" y="160" width="10" height="14" />
            <rect x="100" y="160" width="10" height="14" />
            <rect x="198" y="118" width="10" height="14" />
            <rect x="216" y="118" width="10" height="14" />
            <rect x="198" y="150" width="10" height="14" />
            <rect x="216" y="150" width="10" height="14" />
          </g>
          <path d="M0 296 H300 V315 H0Z" fill="#605f5c" />
        </>
      )}
      {variant === 'hills' && (
        <>
          <circle cx="82" cy="72" r="22" fill="#f1f0ec" />
          <path d="M0 196 C70 150 120 176 176 192 C226 206 262 176 300 186 V315 H0Z" fill="#9b9a96" />
          <path d="M0 236 C80 206 160 224 300 218 V315 H0Z" fill="#7d7c78" />
          <path d="M96 236 C90 200 93 166 101 142 C110 166 113 200 107 236Z" fill="#4a4946" />
          <path d="M206 244 C201 212 204 184 211 166 C219 184 222 212 217 244Z" fill="#545350" />
          <path d="M0 276 C100 262 200 268 300 270 V315 H0Z" fill="#686764" />
        </>
      )}
    </svg>
  );
}

/**
 * Engraved landscape used as the venue postcard when no photo is uploaded.
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
        <linearGradient id="ni-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8e8e8" />
          <stop offset="1" stopColor="#bdbdbd" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#ni-sky)" />
      <circle cx="230" cy="52" r="16" fill="#f7f7f7" />
      <path d="M0 120 C60 95 110 100 160 112 C210 124 250 100 300 108 V200 H0Z" fill="#9a9a9a" />
      <path d="M0 150 C80 130 150 140 300 138 V200 H0Z" fill="#7a7a7a" />
      <rect x="120" y="112" width="70" height="38" fill="#d6d6d6" />
      <path d="M114 114 L155 94 L196 114Z" fill="#6b6b6b" />
      <rect x="132" y="124" width="8" height="10" fill="#555" />
      <rect x="150" y="124" width="8" height="10" fill="#555" />
      <rect x="168" y="124" width="8" height="10" fill="#555" />
      <rect x="150" y="138" width="10" height="12" fill="#444" />
      <path d="M95 150 C90 120 92 90 99 70 C106 90 108 120 103 150Z" fill="#3c3c3c" />
      <path d="M212 150 C208 124 210 100 216 84 C222 100 224 124 220 150Z" fill="#454545" />
      <ellipse cx="40" cy="160" rx="26" ry="14" fill="#5a5a5a" />
      <ellipse cx="262" cy="164" rx="30" ry="15" fill="#555" />
      <path d="M0 176 C100 166 200 170 300 172 V200 H0Z" fill="#666" />
    </svg>
  );
}
