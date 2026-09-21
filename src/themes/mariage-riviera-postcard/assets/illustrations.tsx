/**
 * Inline SVG placeholders of the "Riviera Postcard" theme.
 *
 * Everything is drawn with `var(--stem)`, `var(--accent)`, `var(--seal)`,
 * `var(--bloom)` or `currentColor`, so the couple's palette repaints the whole
 * set without a second file — the argument this product has against a Canva
 * template (BRIEF §7.4).
 *
 * These are *placeholders*: proportions, viewBoxes and colourable parts match
 * exactly what the illustrator must deliver (see `assets/README.md`). Swapping
 * a placeholder for the final asset means replacing one component below, with
 * the same signature and the same `viewBox`.
 *
 * The reused motifs are declared once in `<IllustrationDefs />` and called with
 * `<use>`, so a chapter showing four cypresses ships the path data once.
 */

export const LEMON_ID = 'rp-lemon';
export const CYPRESS_ID = 'rp-cypress';
export const BOUGAIN_ID = 'rp-bougainvillea';
export const PARASOL_ID = 'rp-parasol';
export const SHELL_ID = 'rp-shell';
export const WAVES_ID = 'rp-waves';
export const VESPA_ID = 'rp-vespa';

/* -------------------------------------------------------------------------- */
/* Bougainvillea — deterministic spray of bracts                              */
/* -------------------------------------------------------------------------- */

interface Bract {
  cx: number;
  cy: number;
  r: number;
  rotate: number;
  tone: number;
}

/** The four bract tones, as fractions of `--bloom` mixed towards white/black. */
const BRACT_TONES = [
  'var(--bloom)',
  'color-mix(in srgb, var(--bloom) 72%, #fff)',
  'color-mix(in srgb, var(--bloom) 82%, #7A1038)',
  'color-mix(in srgb, var(--bloom) 55%, #fff)',
] as const;

/**
 * Builds the bougainvillea spray with a seeded Lehmer generator, so the server
 * and the browser draw byte-identical markup (no hydration mismatch) and the
 * branch never reshuffles between renders.
 */
function buildBracts(seed = 11, count = 46): Bract[] {
  let state = seed;
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647;

  const bracts: Bract[] = [];
  for (let i = 0; i < count; i += 1) {
    // A spray, not a ball: wider than tall, drifting down to the right.
    const t = i / count;
    const angle = random() * Math.PI * 2;
    const spread = Math.sqrt(random()) * 26;
    bracts.push({
      cx: Number((30 + t * 58 + Math.cos(angle) * spread * 0.8).toFixed(1)),
      cy: Number((26 + t * 52 + Math.sin(angle) * spread * 0.7).toFixed(1)),
      r: Number((5 + random() * 4.4).toFixed(2)),
      rotate: Math.floor(random() * 120),
      tone: Math.floor(random() * BRACT_TONES.length),
    });
  }
  return bracts;
}

const BRACTS = buildBracts();

/** Three papery bracts around a tiny cream trumpet: the bougainvillea flower. */
const BRACT_ANGLES = [0, 120, 240] as const;

/* -------------------------------------------------------------------------- */
/* Parasol — alternating wedges, generated                                     */
/* -------------------------------------------------------------------------- */

interface Wedge {
  d: string;
  striped: boolean;
}

/**
 * The beach parasol is a half-disc cut into wedges that alternate between the
 * palette ink and the white of the canvas. Generated rather than hand-drawn so
 * the scallop of the hem lands exactly on each seam.
 */
function buildParasol(segments = 8, radius = 74, cx = 80, cy = 96): Wedge[] {
  const wedges: Wedge[] = [];
  for (let i = 0; i < segments; i += 1) {
    const a0 = Math.PI + (i / segments) * Math.PI;
    const a1 = Math.PI + ((i + 1) / segments) * Math.PI;
    const x0 = cx + Math.cos(a0) * radius;
    const y0 = cy + Math.sin(a0) * radius;
    const x1 = cx + Math.cos(a1) * radius;
    const y1 = cy + Math.sin(a1) * radius;
    // The hem dips between two seams: a quadratic sag on the way back.
    const mid = (a0 + a1) / 2;
    const mx = cx + Math.cos(mid) * (radius + 9);
    const my = cy + Math.sin(mid) * (radius + 9);
    wedges.push({
      d: `M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)} Z`,
      striped: i % 2 === 0,
    });
  }
  return wedges;
}

const PARASOL_WEDGES = buildParasol();

/* -------------------------------------------------------------------------- */
/* Shared <defs> block                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Hidden SVG holding every reusable symbol. Rendered once, at the top of the
 * invitation.
 */
export function IllustrationDefs() {
  return (
    <svg width="0" height="0" className="rp-defs" aria-hidden="true" focusable="false">
      {/* ---- Lemon branch ---- */}
      <symbol id={LEMON_ID} viewBox="0 0 90 200">
        <path
          d="M46 198 C42 150 40 104 48 58 C52 36 58 20 68 6"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M47 150 C34 146 24 150 14 160 C28 166 40 162 47 150Z"
          style={{ fill: 'var(--stem)' }}
        />
        <path
          d="M45 118 C58 112 70 116 80 126 C66 132 52 130 45 118Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".88"
        />
        <path
          d="M49 78 C36 74 26 78 17 88 C31 94 42 90 49 78Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".8"
        />
        <path
          d="M56 38 C68 32 79 36 87 46 C74 52 62 50 56 38Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".72"
        />
        {/* Two lemons, with the little nipple that makes them lemons. */}
        <g>
          <path
            d="M44 132 C44 122 48 116 56 116 C64 116 70 124 70 136 C70 148 63 156 55 156 C47 156 44 146 44 132Z"
            style={{ fill: 'var(--accent)' }}
          />
          <path
            d="M56 114 L57 118"
            style={{ stroke: 'var(--stem)' }}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M50 124 C52 132 52 142 49 150"
            fill="none"
            stroke="rgba(255,255,255,.5)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
        <g>
          <path
            d="M22 96 C22 88 26 82 33 82 C41 82 46 90 46 100 C46 111 40 118 33 118 C26 118 22 109 22 96Z"
            style={{ fill: 'var(--accent)' }}
            opacity=".93"
          />
          <path
            d="M33 80 L34 84"
            style={{ stroke: 'var(--stem)' }}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M28 90 C30 96 30 104 27 111"
            fill="none"
            stroke="rgba(255,255,255,.5)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      </symbol>

      {/* ---- Cypress ---- */}
      <symbol id={CYPRESS_ID} viewBox="0 0 80 200">
        <path d="M35 184 L45 184 L43 200 L37 200Z" fill="#7A5B3A" />
        <path
          d="M40 2 C50 26 58 54 62 88 C66 122 64 154 56 178 C50 192 44 196 40 196 C36 196 30 192 24 178 C16 154 14 122 18 88 C22 54 30 26 40 2Z"
          style={{ fill: 'var(--stem)' }}
        />
        {/* The ragged silhouette that tells a cypress from a cone. */}
        <path
          d="M40 8 C49 30 56 58 59 90 C62 122 60 152 53 174 C48 188 43 192 40 192Z"
          fill="rgba(0,0,0,.16)"
        />
        <g stroke="rgba(255,255,255,.24)" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M31 40 C27 66 25 96 27 124" />
          <path d="M49 56 C53 82 54 110 51 138" />
          <path d="M40 92 C40 120 39 148 36 170" />
        </g>
        <g style={{ fill: 'var(--stem)' }}>
          <path d="M18 70 C12 76 10 84 11 92 C16 86 18 78 18 70Z" />
          <path d="M62 96 C68 102 70 110 69 118 C64 112 62 104 62 96Z" />
          <path d="M20 132 C14 138 12 146 13 154 C18 148 20 140 20 132Z" />
        </g>
      </symbol>

      {/* ---- Bougainvillea ---- */}
      <symbol id={BOUGAIN_ID} viewBox="0 0 120 120">
        <path
          d="M6 8 C30 22 58 42 86 74 C98 88 106 100 112 112"
          fill="none"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M38 32 C30 24 20 22 10 24 C18 34 30 38 38 32Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".8"
        />
        <path
          d="M72 66 C80 56 92 52 102 54 C94 66 82 72 72 66Z"
          style={{ fill: 'var(--stem)' }}
          opacity=".7"
        />
        {BRACTS.map((bract, index) => (
          <g key={index} transform={`translate(${bract.cx} ${bract.cy}) rotate(${bract.rotate})`}>
            {BRACT_ANGLES.map((angle) => (
              <path
                key={angle}
                transform={`rotate(${angle})`}
                d={`M0 0 L${(bract.r * 0.78).toFixed(1)} ${(-bract.r * 0.62).toFixed(1)} Q${bract.r.toFixed(1)} ${(-bract.r * 1.5).toFixed(1)} 0 ${(-bract.r * 1.35).toFixed(1)} Q${(-bract.r).toFixed(1)} ${(-bract.r * 1.5).toFixed(1)} ${(-bract.r * 0.78).toFixed(1)} ${(-bract.r * 0.62).toFixed(1)} Z`}
                style={{ fill: BRACT_TONES[bract.tone] }}
              />
            ))}
            <circle r={(bract.r * 0.22).toFixed(1)} fill="#FCF6E4" />
          </g>
        ))}
      </symbol>

      {/* ---- Beach parasol ---- */}
      <symbol id={PARASOL_ID} viewBox="0 0 160 190">
        <path
          d="M79 94 L79 188"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {PARASOL_WEDGES.map((wedge, index) => (
          <path
            key={index}
            d={wedge.d}
            style={{ fill: wedge.striped ? 'var(--seal)' : '#FFFBF1' }}
            stroke="rgba(30,58,95,.18)"
            strokeWidth="0.8"
          />
        ))}
        <circle cx="80" cy="96" r="5" style={{ fill: 'var(--accent)' }} />
        <path
          d="M80 22 L80 6"
          style={{ stroke: 'var(--stem)' }}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="80" cy="4" r="4" style={{ fill: 'var(--accent)' }} />
      </symbol>

      {/* ---- Scallop shell ---- */}
      <symbol id={SHELL_ID} viewBox="0 0 120 110">
        {/* Fan of ribs, wide at the top, closing onto the hinge at the bottom. */}
        <path
          d="M60 104 C24 104 2 78 6 50 C10 26 32 8 60 8 C88 8 110 26 114 50 C118 78 96 104 60 104Z"
          style={{ fill: 'var(--accent)' }}
        />
        {/* The scalloped rim. */}
        <path
          d="M6 50 q7 -12 14 0 t14 0 t14 0 t14 0 t14 0 t14 0 t14 0"
          transform="translate(0 44)"
          fill="none"
          stroke="rgba(150,100,24,.28)"
          strokeWidth="2"
        />
        <g stroke="rgba(150,100,24,.34)" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M60 100 L60 12" />
          <path d="M60 100 L40 16" />
          <path d="M60 100 L80 16" />
          <path d="M60 100 L22 28" />
          <path d="M60 100 L98 28" />
          <path d="M60 100 L11 48" />
          <path d="M60 100 L109 48" />
        </g>
        {/* Hinge. */}
        <path
          d="M48 100 C48 108 53 110 60 110 C67 110 72 108 72 100Z"
          fill="rgba(150,100,24,.38)"
        />
      </symbol>

      {/* ---- Waves ---- */}
      <symbol id={WAVES_ID} viewBox="0 0 200 70">
        <g fill="none" strokeLinecap="round" strokeWidth="4" style={{ stroke: 'var(--seal)' }}>
          <path d="M4 18 q16 -12 32 0 t32 0 t32 0 t32 0 t32 0" opacity=".9" />
          <path d="M4 38 q16 -12 32 0 t32 0 t32 0 t32 0 t32 0" opacity=".65" />
          <path d="M4 58 q16 -12 32 0 t32 0 t32 0 t32 0 t32 0" opacity=".4" />
        </g>
      </symbol>

      {/* ---- Vespa ---- */}
      <symbol id={VESPA_ID} viewBox="0 0 170 120">
        {/* Front shield, step-through floor, rear body: the scooter silhouette. */}
        <path
          d="M52 40 C62 26 74 22 84 24 L86 38 C76 38 68 44 64 56 L60 88 L44 88 L46 58 C46 50 48 44 52 40Z"
          style={{ fill: 'var(--seal)' }}
        />
        <path d="M60 80 L104 80 L104 92 L60 92Z" style={{ fill: 'var(--seal)' }} />
        <path
          d="M100 84 C96 62 104 48 122 46 C140 44 150 58 150 82 L150 92 L100 92Z"
          style={{ fill: 'var(--seal)' }}
        />
        {/* Saddle. */}
        <path d="M96 50 C108 44 124 44 134 48 C126 54 108 56 96 54Z" fill="#2A2A28" />
        {/* Handlebar and mirror. */}
        <path
          d="M62 34 L92 24"
          style={{ stroke: 'var(--seal)' }}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M58 30 L52 14"
          style={{ stroke: 'var(--seal)' }}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="51" cy="11" r="5" style={{ fill: 'var(--accent)' }} />
        {/* Headlight. */}
        <circle cx="50" cy="48" r="8" style={{ fill: 'var(--accent)' }} />
        {/* Wheels. */}
        <circle cx="52" cy="94" r="20" fill="#2A2A28" />
        <circle cx="52" cy="94" r="8" style={{ fill: 'var(--accent)' }} />
        <circle cx="136" cy="94" r="20" fill="#2A2A28" />
        <circle cx="136" cy="94" r="8" style={{ fill: 'var(--accent)' }} />
      </symbol>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Individual illustrations                                                   */
/* -------------------------------------------------------------------------- */

interface IllustrationProps {
  className?: string;
  rotate?: number;
}

function rotateStyle(rotate?: number) {
  return rotate ? { transform: `rotate(${rotate}deg)` } : undefined;
}

/** Lemon branch. Leaves follow `--stem`, the fruit follows `--accent`. */
export function LemonBranch({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 200"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${LEMON_ID}`} />
    </svg>
  );
}

/** Cypress. Entirely `--stem`. */
export function Cypress({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 200"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${CYPRESS_ID}`} />
    </svg>
  );
}

/** Bougainvillea spray. Branch `--stem`, bracts `--bloom`. */
export function Bougainvillea({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${BOUGAIN_ID}`} />
    </svg>
  );
}

/** Striped beach parasol. Canvas alternates `--seal` and white. */
export function Parasol({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 190"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${PARASOL_ID}`} />
    </svg>
  );
}

/** Scallop shell, in `--accent`. */
export function Shell({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 110"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${SHELL_ID}`} />
    </svg>
  );
}

/** Three sea waves, in `--seal`. */
export function Waves({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 70"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${WAVES_ID}`} />
    </svg>
  );
}

/** Scooter, in `--seal` with `--accent` trim. */
export function Vespa({ className, rotate }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 170 120"
      aria-hidden="true"
      focusable="false"
      style={rotateStyle(rotate)}
    >
      <use href={`#${VESPA_ID}`} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Postal furniture                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Postmark: a sun-rayed ring plus the cancellation waves, with the event date
 * at the centre. `currentColor`, so the caller picks the ink.
 */
export function Postmark({ className, date }: { className?: string; date: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const inner = 25;
    const outer = i % 2 === 0 ? 30 : 27.5;
    return {
      x1: (30 + Math.cos(angle) * inner).toFixed(1),
      y1: (30 + Math.sin(angle) * inner).toFixed(1),
      x2: (30 + Math.cos(angle) * outer).toFixed(1),
      y2: (30 + Math.sin(angle) * outer).toFixed(1),
    };
  });

  return (
    <svg className={className} viewBox="0 0 126 60" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="30" cy="30" r="24" />
        <circle cx="30" cy="30" r="17.5" strokeDasharray="3 2.4" />
        {rays.map((ray, index) => (
          <line key={index} {...ray} strokeWidth="1.1" />
        ))}
        <path d="M60 15 q9 -6 18 0 t18 0 t18 0 t12 0" />
        <path d="M60 25 q9 -6 18 0 t18 0 t18 0 t12 0" />
        <path d="M60 35 q9 -6 18 0 t18 0 t18 0 t12 0" />
        <path d="M60 45 q9 -6 18 0 t18 0 t18 0 t12 0" />
      </g>
      <text
        x="30"
        y="33"
        textAnchor="middle"
        fontSize="7.2"
        fill="currentColor"
        fontFamily="Georgia,serif"
        letterSpacing="0.6"
      >
        {date}
      </text>
    </svg>
  );
}

/** The five illustrated stamps of the sheet. */
export const STAMP_MOTIFS = ['lemon', 'cypress', 'vespa', 'parasol', 'shell'] as const;
export type StampMotif = (typeof STAMP_MOTIFS)[number];

/** The motif inside a stamp, without its frame. */
function StampMotifArt({ motif }: { motif: StampMotif }) {
  switch (motif) {
    case 'cypress':
      return <Cypress />;
    case 'vespa':
      return <Vespa />;
    case 'parasol':
      return <Parasol />;
    case 'shell':
      return <Shell />;
    default:
      return <LemonBranch />;
  }
}

/**
 * Perforated stamp. The perforation is a CSS mask (see `styles.css`); the SVG
 * only carries the motif, which is why the palette repaints it.
 */
export function Stamp({
  className,
  motif = 'lemon',
  value,
  country,
}: {
  className?: string;
  motif?: StampMotif;
  value: string;
  country?: string;
}) {
  return (
    <span className={`stamp st-${motif}${className ? ` ${className}` : ''}`}>
      <span className="in">
        <StampMotifArt motif={motif} />
        {country ? <em>{country}</em> : null}
        <i>{value}</i>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Photo placeholders                                                         */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_VARIANTS = ['coast', 'grove', 'terrace'] as const;
export type PlaceholderVariant = (typeof PLACEHOLDER_VARIANTS)[number];

/** Picks a stable placeholder scene from the slot id, so it never flickers. */
export function placeholderVariant(slotId: string): PlaceholderVariant {
  let hash = 0;
  for (let i = 0; i < slotId.length; i += 1) hash = (hash * 31 + slotId.charCodeAt(i)) % 997;
  return PLACEHOLDER_VARIANTS[hash % PLACEHOLDER_VARIANTS.length] ?? 'coast';
}

/**
 * Stand-in for an empty photo slot: a sun-bleached Riviera scene in colour,
 * never a broken image. Drawn in SVG so it scales to any frame.
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
      <rect width="300" height="315" fill="#DCEBF2" />
      {variant === 'coast' && (
        <>
          <circle cx="232" cy="66" r="30" fill="#F6DC8E" />
          <path
            d="M0 176 C60 150 120 162 180 152 C224 145 262 150 300 142 V315 H0Z"
            fill="#9FC2A6"
          />
          <path d="M0 196 H300 V315 H0Z" fill="#3E7FA8" />
          <g fill="none" stroke="#BFDCEA" strokeWidth="5" strokeLinecap="round">
            <path d="M-10 226 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0" />
            <path d="M-10 258 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0" opacity=".75" />
            <path d="M-10 290 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0" opacity=".55" />
          </g>
          <g fill="#3F6B4E">
            <path d="M54 176 C62 140 66 108 62 84 C56 108 48 140 50 176Z" />
            <path d="M84 176 C92 146 95 118 91 96 C85 118 78 146 80 176Z" />
          </g>
          <path d="M180 176 L206 132 L232 176Z" fill="#C8553D" />
          <rect x="188" y="152" width="36" height="24" fill="#F6EEDF" />
        </>
      )}
      {variant === 'grove' && (
        <>
          <rect width="300" height="315" fill="#EAF1DC" />
          <g stroke="#5B7F4E" strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M60 315 C56 250 58 190 70 140" />
            <path d="M212 315 C218 250 214 190 204 146" />
          </g>
          <g fill="#4C7A5E">
            <ellipse cx="78" cy="118" rx="62" ry="46" />
            <ellipse cx="200" cy="124" rx="58" ry="44" />
            <ellipse cx="140" cy="70" rx="66" ry="42" />
          </g>
          <g fill="#E8B923">
            <ellipse cx="60" cy="132" rx="13" ry="16" />
            <ellipse cx="104" cy="100" rx="12" ry="15" />
            <ellipse cx="176" cy="140" rx="12" ry="15" />
            <ellipse cx="220" cy="106" rx="13" ry="16" />
            <ellipse cx="146" cy="60" rx="12" ry="15" />
          </g>
          <path d="M0 268 H300 V315 H0Z" fill="#C9AE84" />
        </>
      )}
      {variant === 'terrace' && (
        <>
          <rect width="300" height="315" fill="#F4EDE0" />
          <rect y="206" width="300" height="109" fill="#E3D6C0" />
          {/* Striped awning hanging from the top, with a scalloped hem. */}
          <rect width="300" height="112" fill="#FBF6EA" />
          <g fill="#1E3A5F">
            <rect x="0" width="26" height="112" />
            <rect x="52" width="26" height="112" />
            <rect x="104" width="26" height="112" />
            <rect x="156" width="26" height="112" />
            <rect x="208" width="26" height="112" />
            <rect x="260" width="26" height="112" />
          </g>
          <path
            d="M0 112 q13 22 26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 V112Z"
            fill="#1E3A5F"
            opacity=".82"
          />
          <g fill="#C8553D">
            <rect x="34" y="232" width="46" height="56" rx="5" />
            <rect x="204" y="240" width="40" height="48" rx="5" />
          </g>
          <g fill="#4C7A5E">
            <ellipse cx="57" cy="220" rx="32" ry="24" />
            <ellipse cx="224" cy="232" rx="27" ry="19" />
          </g>
          <rect x="108" y="246" width="84" height="9" rx="4" fill="#FBF6EA" />
          <rect x="145" y="255" width="10" height="48" fill="#CBBFA6" />
        </>
      )}
    </svg>
  );
}

/**
 * Sun-bleached bay used as the venue postcard when no photo is uploaded.
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
        <linearGradient id="rp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFE0EF" />
          <stop offset="1" stopColor="#F3E4C6" />
        </linearGradient>
        <linearGradient id="rp-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E7FA8" />
          <stop offset="1" stopColor="#1E5A80" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#rp-sky)" />
      <circle cx="246" cy="42" r="19" fill="#F7DE92" />
      <path d="M0 108 C44 78 92 86 130 94 C176 104 232 88 300 96 V200 H0Z" fill="#A8BE8E" />
      <path d="M0 132 H300 V200 H0Z" fill="url(#rp-sea)" />
      {/* Cliff village: cubes of ochre and white with terracotta roofs. */}
      <g>
        <rect x="24" y="86" width="34" height="46" fill="#F6EBD8" />
        <path d="M20 88 L41 70 L62 88Z" fill="#C8553D" />
        <rect x="62" y="96" width="28" height="36" fill="#EFD9B4" />
        <path d="M58 98 L76 84 L94 98Z" fill="#B8462F" />
        <rect x="200" y="94" width="30" height="38" fill="#F6EBD8" />
        <path d="M196 96 L215 80 L234 96Z" fill="#C8553D" />
        <rect x="236" y="102" width="24" height="30" fill="#EFD9B4" />
        <path d="M232 104 L248 92 L264 104Z" fill="#B8462F" />
        <g fill="#1E3A5F" opacity=".7">
          <rect x="32" y="98" width="7" height="10" />
          <rect x="45" y="98" width="7" height="10" />
          <rect x="70" y="106" width="6" height="9" />
          <rect x="208" y="106" width="6" height="9" />
          <rect x="219" y="106" width="6" height="9" />
        </g>
      </g>
      <g fill="#3F6B4E">
        <path d="M112 132 C119 100 122 76 118 56 C112 76 104 100 106 132Z" />
        <path d="M140 132 C147 106 149 84 146 66 C140 84 133 106 135 132Z" />
        <path d="M168 132 C174 104 177 82 173 62 C167 82 160 104 162 132Z" />
      </g>
      <g fill="none" stroke="#CFE6F1" strokeWidth="3.4" strokeLinecap="round">
        <path d="M-6 150 q24 -9 48 0 t48 0 t48 0 t48 0 t48 0 t48 0" />
        <path d="M-6 172 q24 -9 48 0 t48 0 t48 0 t48 0 t48 0 t48 0" opacity=".7" />
        <path d="M-6 192 q24 -9 48 0 t48 0 t48 0 t48 0 t48 0 t48 0" opacity=".5" />
      </g>
      {/* A little boat. */}
      <g>
        <path d="M54 158 L96 158 L88 168 L62 168Z" fill="#FBF3E2" />
        <path d="M75 156 L75 128 L96 156Z" fill="#E8B923" />
      </g>
    </svg>
  );
}
