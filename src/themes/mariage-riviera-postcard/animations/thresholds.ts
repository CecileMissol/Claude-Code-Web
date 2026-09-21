/**
 * Pure scroll-animation maths for "Riviera Postcard".
 *
 * Everything the chapters need to decide *what shows when* lives here, with no
 * DOM and no GSAP, so it can be unit-tested and reasoned about. The engine is
 * the one validated in phase 3 (`docs/phase-3-theme-noir-ivoire.md` §3.2): a
 * sticky scene, a 0→1 progress, pieces switched on at their threshold. Only the
 * composition differs — this theme lays its programme out as a single trattoria
 * menu board instead of a pile of torn notes, so it needs row thresholds rather
 * than a card layout.
 */

/** Chapter length, as a multiple of the viewport height. */
export const CHAPTER_LENGTH = {
  story: 400,
  date: 340,
  program: 360,
  place: 320,
} as const;

export type ChapterId = keyof typeof CHAPTER_LENGTH;

/**
 * Where the first and the last sentence of each chapter land. Sentences in
 * between are spread evenly over the band.
 */
export const LINE_SPAN: Record<ChapterId, readonly [start: number, end: number]> = {
  story: [0.04, 0.78],
  date: [0.04, 0.68],
  program: [0.04, 0.72],
  place: [0.04, 0.66],
};

/** Where the programme rows are written onto the menu board, whatever their number. */
export const PROGRAM_SPAN: readonly [start: number, end: number] = [0.14, 0.7];

/** Fixed thresholds of the decorative pieces, per chapter. */
export const PIECE_AT = {
  story: {
    photo1: 0.05,
    memento: 0.23,
    photo2: 0.41,
    parasol: 0.56,
    note: 0.62,
    bougainvillea: 0.8,
  },
  date: {
    day: 0.06,
    month: 0.2,
    year: 0.34,
    cypressLeft: 0.44,
    cypressRight: 0.47,
    highlight: 0.54,
    waves: 0.62,
    countdown: 0.72,
  },
  program: {
    board: 0.04,
    lemon: 0.82,
  },
  place: {
    postcard: 0.06,
    stamp: 0.3,
    postmark: 0.4,
    shell: 0.6,
    waves: 0.74,
  },
} as const;

/** Threshold at which the "open directions" button appears. */
export const DIRECTIONS_AT = 0.66;

/**
 * Scroll progress of a sticky chapter: 0 when the chapter's top reaches the top
 * of the viewport, 1 when its bottom reaches the bottom. `top` is the chapter's
 * `getBoundingClientRect().top`.
 *
 * ScrollTrigger gives the same number without depending on `innerHeight`, which
 * is what makes it stable while the iOS address bar collapses; this function
 * stays as the single definition of the maths, and is what the tests pin.
 */
export function chapterProgress(top: number, height: number, viewportHeight: number): number {
  const travel = height - viewportHeight;
  if (travel <= 0) return top <= 0 ? 1 : 0;
  return clamp01(-top / travel);
}

/** Clamps to the 0–1 range. NaN and -0 both come back as a plain 0. */
export function clamp01(value: number): number {
  if (!(value > 0)) return 0;
  return value > 1 ? 1 : value;
}

/**
 * Spreads `count` thresholds evenly over `[start, end]`.
 * A single item sits on `start`; two sit on both ends.
 */
export function spread(start: number, end: number, count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => round3(start + index * step));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Thresholds of a chapter's sentences, one per line. */
export function lineThresholds(chapter: ChapterId, count: number): number[] {
  const [start, end] = LINE_SPAN[chapter];
  return spread(start, end, count);
}

/**
 * Index of the sentence to show at a given progress, or `-1` before the first
 * one. Only that sentence is visible; earlier ones are marked "past" and drift
 * upwards.
 */
export function activeLineIndex(progress: number, thresholds: readonly number[]): number {
  let active = -1;
  for (let index = 0; index < thresholds.length; index += 1) {
    if (progress >= (thresholds[index] ?? Infinity)) active = index;
  }
  return active;
}

/** A piece is on as soon as the chapter progress passes its threshold. */
export function isPieceOn(progress: number, at: number): boolean {
  return progress >= at;
}

/* -------------------------------------------------------------------------- */
/* Programme layout                                                           */
/* -------------------------------------------------------------------------- */

export interface ProgramRow {
  /** Scroll threshold at which the row is written onto the board. */
  at: number;
  /** Rows lean alternately, like chalk written by a hurried hand. */
  tilt: number;
}

const ROW_TILTS = [-0.6, 0.5, -0.4, 0.7, -0.5, 0.4] as const;

/**
 * Lays the programme rows out on the menu board. Unlike the collage of theme 1,
 * the cards do not fly in from the sides: the board arrives first and the lines
 * are written on it one after another, which is what a chalkboard menu does and
 * what keeps six items legible on a 390 px screen.
 *
 * The board itself is sized from the row count by the stylesheet (`--rows`).
 */
export function programRows(count: number): ProgramRow[] {
  const ats = spread(PROGRAM_SPAN[0], PROGRAM_SPAN[1], count);

  return Array.from({ length: count }, (_, index) => ({
    at: ats[index] ?? PROGRAM_SPAN[1],
    tilt: ROW_TILTS[index % ROW_TILTS.length] ?? 0,
  }));
}

/* -------------------------------------------------------------------------- */
/* Intro timeline                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Cue points of the envelope-opening timeline, in seconds. The air-mail
 * envelope turns over, the blue seal pops, the flap lifts, the postcard and the
 * two snapshots slide out, the greenery tucks itself in, and scrolling is
 * released on the last beat.
 */
export const INTRO = {
  flip: 0,
  crack: 0.8,
  open: 1.05,
  under: 1.5,
  rise: 1.55,
  bloom: 2.3,
  ready: 2.7,
} as const;

/** Total duration of the intro timeline, in seconds. */
export const INTRO_DURATION = INTRO.ready;

/* -------------------------------------------------------------------------- */
/* Countdown                                                                  */
/* -------------------------------------------------------------------------- */

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Splits a remaining duration in milliseconds. Never goes negative. */
export function countdownParts(remainingMs: number): CountdownParts {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
