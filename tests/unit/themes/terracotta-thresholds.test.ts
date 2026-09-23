import { describe, expect, it } from 'vitest';
import {
  activeLineIndex,
  chapterProgress,
  CHAPTER_LENGTH,
  clamp01,
  countdownParts,
  INTRO,
  isPieceOn,
  lineThresholds,
  PIECE_AT,
  programLayout,
  spread,
} from '@/themes/mariage-terracotta-bloom/animations/thresholds';

/**
 * The scroll maths of the theme. "Terracotta Bloom" keeps the engine and the
 * beats validated in phase 3 — only the pieces placed on them changed — so the
 * numbers are pinned here too.
 */

describe('chapterProgress', () => {
  const height = 4200; // 420 vh at a 1000 px viewport
  const viewport = 1000;

  it('is 0 before the chapter reaches the top of the viewport', () => {
    expect(chapterProgress(500, height, viewport)).toBe(0);
    expect(chapterProgress(0, height, viewport)).toBe(0);
  });

  it('is 1 once the chapter bottom reaches the viewport bottom', () => {
    expect(chapterProgress(-(height - viewport), height, viewport)).toBe(1);
    expect(chapterProgress(-9999, height, viewport)).toBe(1);
  });

  it('is linear in between, exactly like the mock-up', () => {
    // -top / (height - vh)
    expect(chapterProgress(-1600, height, viewport)).toBeCloseTo(0.5, 6);
    expect(chapterProgress(-800, height, viewport)).toBeCloseTo(0.25, 6);
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
  it('spreads the five sentences of the story over the chapter', () => {
    // Evenly spread over the band [0.04, 0.78].
    expect(lineThresholds('story', 5)).toEqual([0.04, 0.225, 0.41, 0.595, 0.78]);
  });

  it('keeps the date chapter inside its band', () => {
    const thresholds = lineThresholds('date', 3);
    expect(thresholds[0]).toBe(0.04);
    expect(thresholds.at(-1)).toBe(0.68);
  });

  it('stays inside 0–1 for the maximum number of lines', () => {
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

describe('programLayout', () => {
  it('lays the four programme cards out alternately', () => {
    const layout = programLayout(4);
    expect(layout.map((slot) => slot.at)).toEqual([0.08, 0.28, 0.48, 0.68]);
    expect(layout.map((slot) => slot.fromRight)).toEqual([false, true, false, true]);
    expect(layout.every((slot) => slot.width === 56)).toBe(true);
  });

  it('stays composed with a single item', () => {
    const layout = programLayout(1);
    expect(layout).toHaveLength(1);
    expect(layout[0]?.at).toBe(0.08);
    expect(layout[0]?.fromRight).toBe(false);
  });

  it('narrows the cards and keeps them inside the board for six items', () => {
    const layout = programLayout(6);
    expect(layout).toHaveLength(6);
    expect(layout.every((slot) => slot.width === 45)).toBe(true);
    for (const slot of layout) {
      expect(slot.at).toBeGreaterThanOrEqual(0.08);
      expect(slot.at).toBeLessThanOrEqual(0.68);
      expect(slot.top).toBeGreaterThanOrEqual(2);
      expect(slot.top).toBeLessThanOrEqual(68);
    }
  });

  it('always alternates sides', () => {
    for (const count of [2, 3, 4, 5, 6]) {
      const sides = programLayout(count).map((slot) => slot.fromRight);
      for (let i = 1; i < sides.length; i += 1) {
        expect(sides[i]).not.toBe(sides[i - 1]);
      }
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

describe('pinned constants', () => {
  it('keeps the validated chapter lengths', () => {
    expect(CHAPTER_LENGTH).toEqual({ story: 420, date: 320, program: 380, place: 300 });
  });

  it('keeps the validated intro beats, in seconds', () => {
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
});
