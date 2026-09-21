import { describe, expect, it } from 'vitest';
import {
  activeLineIndex,
  chapterProgress,
  CHAPTER_LENGTH,
  clamp01,
  countdownParts,
  DIRECTIONS_AT,
  INTRO,
  isPieceOn,
  lineThresholds,
  PIECE_AT,
  PROGRAM_SPAN,
  programRows,
  spread,
} from '@/themes/mariage-riviera-postcard/animations/thresholds';

/**
 * The scroll maths of "Riviera Postcard".
 *
 * The engine is the one validated in phase 3; what is pinned here is the
 * composition proper to this theme — in particular the trattoria menu, whose
 * rows are written onto a single board instead of flying in as separate cards.
 */

describe('chapterProgress', () => {
  const height = 4000; // 400 vh at a 1000 px viewport
  const viewport = 1000;

  it('is 0 before the chapter reaches the top of the viewport', () => {
    expect(chapterProgress(500, height, viewport)).toBe(0);
    expect(chapterProgress(0, height, viewport)).toBe(0);
  });

  it('is 1 once the chapter bottom reaches the viewport bottom', () => {
    expect(chapterProgress(-(height - viewport), height, viewport)).toBe(1);
    expect(chapterProgress(-9999, height, viewport)).toBe(1);
  });

  it('is linear in between', () => {
    expect(chapterProgress(-1500, height, viewport)).toBeCloseTo(0.5, 6);
    expect(chapterProgress(-750, height, viewport)).toBeCloseTo(0.25, 6);
  });

  it('never divides by zero when the chapter is shorter than the viewport', () => {
    expect(chapterProgress(10, 500, 1000)).toBe(0);
    expect(chapterProgress(-10, 500, 1000)).toBe(1);
  });
});

describe('clamp01', () => {
  it('clamps and neutralises NaN', () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(Number.NaN)).toBe(0);
  });
});

describe('spread', () => {
  it('puts a single item on the start of the band', () => {
    expect(spread(0.04, 0.78, 1)).toEqual([0.04]);
  });

  it('puts two items on both ends', () => {
    expect(spread(0.04, 0.78, 2)).toEqual([0.04, 0.78]);
  });

  it('spreads evenly', () => {
    expect(spread(0, 1, 5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('returns nothing for an empty chapter', () => {
    expect(spread(0.04, 0.78, 0)).toEqual([]);
  });
});

describe('lineThresholds', () => {
  it('spreads the five sentences of the story over its band', () => {
    expect(lineThresholds('story', 5)).toEqual([0.04, 0.225, 0.41, 0.595, 0.78]);
  });

  it('keeps the date chapter inside its band', () => {
    const thresholds = lineThresholds('date', 3);
    expect(thresholds[0]).toBe(0.04);
    expect(thresholds.at(-1)).toBe(0.68);
  });

  it('stays inside 0–1 for every allowed number of lines', () => {
    for (const count of [1, 2, 3, 4, 5, 6]) {
      for (const threshold of lineThresholds('story', count)) {
        expect(threshold).toBeGreaterThanOrEqual(0);
        expect(threshold).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('activeLineIndex', () => {
  const thresholds = [0.04, 0.225, 0.41, 0.595, 0.78];

  it('shows nothing before the first sentence', () => {
    expect(activeLineIndex(0, thresholds)).toBe(-1);
    expect(activeLineIndex(0.039, thresholds)).toBe(-1);
  });

  it('shows exactly one sentence at a time', () => {
    expect(activeLineIndex(0.04, thresholds)).toBe(0);
    expect(activeLineIndex(0.3, thresholds)).toBe(1);
    expect(activeLineIndex(0.5, thresholds)).toBe(2);
    expect(activeLineIndex(1, thresholds)).toBe(4);
  });

  it('copes with an empty chapter', () => {
    expect(activeLineIndex(0.5, [])).toBe(-1);
  });
});

describe('isPieceOn', () => {
  it('turns a piece on at its threshold and keeps it on', () => {
    expect(isPieceOn(0.04, 0.05)).toBe(false);
    expect(isPieceOn(0.05, 0.05)).toBe(true);
    expect(isPieceOn(1, 0.05)).toBe(true);
  });
});

describe('programRows', () => {
  it('writes the four demo items onto the board one after another', () => {
    const rows = programRows(4);
    expect(rows.map((row) => row.at)).toEqual([0.14, 0.327, 0.513, 0.7]);
  });

  it('starts a single item at the top of the band', () => {
    const rows = programRows(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.at).toBe(PROGRAM_SPAN[0]);
  });

  it('keeps every row inside the band, from one to six items', () => {
    for (const count of [1, 2, 3, 4, 5, 6]) {
      const rows = programRows(count);
      expect(rows).toHaveLength(count);
      for (const row of rows) {
        expect(row.at).toBeGreaterThanOrEqual(PROGRAM_SPAN[0]);
        expect(row.at).toBeLessThanOrEqual(PROGRAM_SPAN[1]);
      }
    }
  });

  it('never writes a row before the board has landed', () => {
    for (const count of [1, 4, 6]) {
      for (const row of programRows(count)) {
        expect(row.at).toBeGreaterThan(PIECE_AT.program.board);
      }
    }
  });

  it('alternates the lean of the rows', () => {
    const tilts = programRows(6).map((row) => Math.sign(row.tilt));
    for (let i = 1; i < tilts.length; i += 1) {
      expect(tilts[i]).not.toBe(tilts[i - 1]);
    }
  });
});

describe('countdownParts', () => {
  it('splits a duration', () => {
    const ms = ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;
    expect(countdownParts(ms)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
  });

  it('never goes negative once the day has come', () => {
    expect(countdownParts(-10_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('composition constants', () => {
  it('keeps the chapter lengths of the theme', () => {
    expect(CHAPTER_LENGTH).toEqual({ story: 400, date: 340, program: 360, place: 320 });
  });

  it('keeps the intro beats, in seconds', () => {
    expect(INTRO).toEqual({
      flip: 0,
      crack: 0.8,
      open: 1.05,
      under: 1.5,
      rise: 1.55,
      bloom: 2.3,
      ready: 2.7,
    });
  });

  it('orders the pieces of each chapter', () => {
    const ordered = (values: number[]) =>
      values.every((value, index) => index === 0 || value >= (values[index - 1] ?? 0));

    expect(ordered(Object.values(PIECE_AT.story))).toBe(true);
    expect(ordered(Object.values(PIECE_AT.date))).toBe(true);
    expect(ordered(Object.values(PIECE_AT.place))).toBe(true);
  });

  it('shows the directions button while the venue chapter is still on screen', () => {
    expect(DIRECTIONS_AT).toBeGreaterThan(PIECE_AT.place.postmark);
    expect(DIRECTIONS_AT).toBeLessThan(1);
  });
});
