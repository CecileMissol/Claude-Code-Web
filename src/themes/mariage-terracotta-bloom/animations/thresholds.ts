/**
 * Pure scroll-animation maths for "Terracotta Bloom".
 *
 * Everything the chapters need to decide *what shows when* lives here, with no
 * DOM and no GSAP, so it can be unit-tested and reasoned about. The values come
 * straight from the validated mock-up (`reference/invitation-mariage-demo.html`)
 * — the mock-up hard-codes them per element; here they are derived, so a couple
 * with three story lines or six programme items still gets a balanced chapter.
 */

/** Chapter length, as a multiple of the viewport height (the mock-up's `--len`). */
export const CHAPTER_LENGTH = {
  story: 420,
  date: 320,
  program: 380,
  place: 300,
} as const;

export type ChapterId = keyof typeof CHAPTER_LENGTH;

/**
 * Where the first and the last sentence of each chapter land, taken from the
 * mock-up. Sentences in between are spread evenly.
 */
export const LINE_SPAN: Record<ChapterId, readonly [start: number, end: number]> = {
  story: [0.04, 0.78],
  date: [0.04, 0.68],
  program: [0.04, 0.72],
  place: [0.04, 0.66],
};

/** Where the programme cards land, whatever their number (mock-up: 4 → .08 … .68). */
export const PROGRAM_SPAN: readonly [start: number, end: number] = [0.08, 0.68];

/** Vertical band the programme cards are laid out in, in board percent. */
export const PROGRAM_TOP_SPAN: readonly [start: number, end: number] = [2, 68];

/** Fixed thresholds of the decorative pieces, per chapter. */
export const PIECE_AT = {
  story: {
    photo1: 0.05,
    memento: 0.23,
    photo2: 0.41,
    sprig: 0.58,
    note: 0.62,
    bloom: 0.8,
  },
  date: {
    day: 0.06,
    month: 0.2,
    year: 0.34,
    sprigLeft: 0.44,
    sprigRight: 0.47,
    highlight: 0.52,
    countdown: 0.7,
  },
  program: {
    bloom: 0.84,
  },
  place: {
    postcard: 0.06,
    stamp: 0.3,
    postmark: 0.38,
    bloom: 0.62,
    eucalyptus: 0.74,
  },
} as const;

/** Threshold at which the "open directions" button appears. */
export const DIRECTIONS_AT = 0.66;

/**
 * Scroll progress of a sticky chapter, exactly as the mock-up computes it:
 * 0 when the chapter's top reaches the top of the viewport, 1 when its bottom
 * reaches the bottom. `top` is the chapter's `getBoundingClientRect().top`.
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
 * upwards, as in the mock-up.
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

export interface ProgramSlot {
  /** Scroll threshold at which the card flies in. */
  at: number;
  /** `true` when the card enters from the right and hugs the right edge. */
  fromRight: boolean;
  /** Board percentages. */
  top: number;
  width: number;
  /** Resting tilt, in degrees. */
  rotate: number;
}

const PROGRAM_ROTATIONS = [-3, 2.5, -1.5, 3, -2, 1.8] as const;

/**
 * Lays the programme cards out so the pile stays legible from one to six
 * items: they alternate left/right, spread over the same vertical band, and
 * narrow slightly as they get more numerous.
 */
export function programLayout(count: number): ProgramSlot[] {
  const ats = spread(PROGRAM_SPAN[0], PROGRAM_SPAN[1], count);
  const tops = spread(PROGRAM_TOP_SPAN[0], PROGRAM_TOP_SPAN[1], count);
  const width = count <= 4 ? 56 : count === 5 ? 50 : 45;

  return Array.from({ length: count }, (_, index) => ({
    at: ats[index] ?? PROGRAM_SPAN[1],
    fromRight: index % 2 === 1,
    top: tops[index] ?? PROGRAM_TOP_SPAN[1],
    width,
    rotate: PROGRAM_ROTATIONS[index % PROGRAM_ROTATIONS.length] ?? 0,
  }));
}

/* -------------------------------------------------------------------------- */
/* Intro timeline                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Cue points of the envelope-opening timeline, in seconds. Same beats as the
 * mock-up's `setTimeout` chain (0 / 800 / 1050 / 1500 / 1550 / 2300 / 2700 ms),
 * replayed here by a single GSAP timeline.
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
