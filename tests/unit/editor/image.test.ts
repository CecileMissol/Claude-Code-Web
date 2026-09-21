import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CROP,
  PHOTO_MAX_EDGE,
  cropRect,
  isAcceptedInput,
  targetSize,
} from '@/editor/image';

/**
 * The geometry of the client-side resize. `preparePhoto()` itself needs a
 * canvas, so only its maths is unit-tested — that is where the bugs live.
 */

describe('cropRect', () => {
  it('takes the largest rectangle of the slot ratio, centred', () => {
    // 4:3 source, square slot.
    expect(cropRect({ width: 4000, height: 3000 }, 1)).toEqual({
      x: 500,
      y: 0,
      width: 3000,
      height: 3000,
    });

    // Portrait source, 3:2 slot.
    expect(cropRect({ width: 1000, height: 2000 }, 3 / 2)).toEqual({
      x: 0,
      y: 667,
      width: 1000,
      height: 667,
    });
  });

  it('keeps the whole image when the ratios already match', () => {
    expect(cropRect({ width: 1200, height: 800 }, 1.5)).toEqual({
      x: 0,
      y: 0,
      width: 1200,
      height: 800,
    });
  });

  it('shrinks around the focus point when zooming, without leaving the image', () => {
    const zoomed = cropRect({ width: 1000, height: 1000 }, 1, {
      focusX: 0.5,
      focusY: 0.5,
      zoom: 2,
    });
    expect(zoomed).toEqual({ x: 250, y: 250, width: 500, height: 500 });

    const corner = cropRect({ width: 1000, height: 1000 }, 1, { focusX: 0, focusY: 1, zoom: 2 });
    expect(corner).toEqual({ x: 0, y: 500, width: 500, height: 500 });
  });

  it('clamps the zoom and falls back to the source ratio', () => {
    const tooClose = cropRect({ width: 1000, height: 1000 }, 1, { ...DEFAULT_CROP, zoom: 99 });
    expect(tooClose.width).toBe(200);

    const noAspect = cropRect({ width: 800, height: 400 }, 0);
    expect(noAspect).toEqual({ x: 0, y: 0, width: 800, height: 400 });
  });
});

describe('targetSize', () => {
  it('caps the longest edge and keeps the ratio', () => {
    expect(targetSize({ width: 4000, height: 3000 })).toEqual({
      width: PHOTO_MAX_EDGE,
      height: 1200,
    });
    expect(targetSize({ width: 3000, height: 4000 })).toEqual({
      width: 1200,
      height: PHOTO_MAX_EDGE,
    });
  });

  it('never enlarges a small photo', () => {
    expect(targetSize({ width: 320, height: 240 })).toEqual({ width: 320, height: 240 });
  });

  it('honours a custom edge, e.g. a thumbnail', () => {
    expect(targetSize({ width: 1600, height: 1600 }, 480)).toEqual({ width: 480, height: 480 });
  });
});

describe('isAcceptedInput', () => {
  it('takes any image and refuses the rest', () => {
    expect(isAcceptedInput('image/jpeg')).toBe(true);
    expect(isAcceptedInput('image/heic')).toBe(true);
    expect(isAcceptedInput('application/pdf')).toBe(false);
    expect(isAcceptedInput('')).toBe(false);
  });
});
