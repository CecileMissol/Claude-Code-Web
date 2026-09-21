/**
 * Photo preparation, in the browser.
 *
 * The Worker never processes an image: the file is cropped to the aspect ratio
 * of the theme's photo slot, scaled down and re-encoded to WebP with a canvas,
 * then PUT to R2 through a signed ticket. The geometry is split out as pure
 * functions so it can be unit-tested without a DOM.
 *
 * Sizes follow `docs/phase-1-cadrage.md`: the longest edge is capped at
 * {@link PHOTO_MAX_EDGE}. Only that one rendition is stored, because the common
 * `Photo` schema holds exactly one R2 key per slot (see
 * `docs/phase-4-editeur.md`, "Limites").
 */

export const PHOTO_MAX_EDGE = 1600;

/** Upper bound enforced by `src/lib/r2.ts` (5 MB). */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const PHOTO_MIME = 'image/webp';

/** Encoding qualities tried in order until the file fits {@link PHOTO_MAX_BYTES}. */
export const PHOTO_QUALITY_STEPS = [0.82, 0.7, 0.6, 0.5] as const;

/** Accepted input types; anything else is rejected before any work is done. */
export const ACCEPTED_INPUT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/gif',
] as const;

export interface CropSettings {
  /** Centre of the crop, in 0…1 of the source image. */
  focusX: number;
  focusY: number;
  /** 1 = the whole frame, 3 = three times closer. */
  zoom: number;
}

export const DEFAULT_CROP: CropSettings = { focusX: 0.5, focusY: 0.5, zoom: 1 };

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The source rectangle to read for a slot.
 *
 * At zoom 1 it is the largest rectangle of the requested `aspect` that fits in
 * the image; zooming shrinks it around the focus point without ever leaving the
 * image.
 *
 * @param aspect width / height of the slot, as declared by the theme manifest.
 */
export function cropRect(
  source: Size,
  aspect: number,
  crop: CropSettings = DEFAULT_CROP,
): Rect {
  const safeAspect = aspect > 0 ? aspect : source.width / source.height;
  const zoom = clamp(crop.zoom, 1, 5);

  const baseWidth = Math.min(source.width, source.height * safeAspect);
  const baseHeight = baseWidth / safeAspect;

  const width = Math.max(1, Math.round(baseWidth / zoom));
  const height = Math.max(1, Math.round(baseHeight / zoom));

  const x = Math.round(clamp(crop.focusX * source.width - width / 2, 0, source.width - width));
  const y = Math.round(clamp(crop.focusY * source.height - height / 2, 0, source.height - height));

  return { x, y, width, height };
}

/**
 * Output size of a crop: scaled down so its longest edge is at most `maxEdge`,
 * never scaled up.
 */
export function targetSize(crop: Size, maxEdge: number = PHOTO_MAX_EDGE): Size {
  const longest = Math.max(crop.width, crop.height);
  const scale = longest > maxEdge ? maxEdge / longest : 1;

  return {
    width: Math.max(1, Math.round(crop.width * scale)),
    height: Math.max(1, Math.round(crop.height * scale)),
  };
}

/** True when the browser can read this file at all. */
export function isAcceptedInput(type: string): boolean {
  return (ACCEPTED_INPUT_TYPES as readonly string[]).includes(type) || type.startsWith('image/');
}

export interface PreparedPhoto {
  blob: Blob;
  width: number;
  height: number;
  /** Quality actually used, after the size fallbacks. */
  quality: number;
}

export class PhotoTooLargeError extends Error {
  constructor() {
    super('The compressed photo is still larger than the allowed size.');
    this.name = 'PhotoTooLargeError';
  }
}

/**
 * Crops, resizes and encodes a picked file to WebP.
 * Browser-only: it needs `createImageBitmap` and a canvas.
 *
 * @throws {PhotoTooLargeError} when even the lowest quality exceeds 5 MB.
 */
export async function preparePhoto(
  file: Blob,
  options: { aspect: number; crop?: CropSettings; maxEdge?: number; maxBytes?: number } ,
): Promise<PreparedPhoto> {
  const bitmap = await createImageBitmap(file);
  try {
    const rect = cropRect(
      { width: bitmap.width, height: bitmap.height },
      options.aspect,
      options.crop ?? DEFAULT_CROP,
    );
    const size = targetSize(rect, options.maxEdge ?? PHOTO_MAX_EDGE);

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot prepare photos (no 2D canvas).');
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      bitmap,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      size.width,
      size.height,
    );

    const maxBytes = options.maxBytes ?? PHOTO_MAX_BYTES;
    for (const quality of PHOTO_QUALITY_STEPS) {
      const blob = await toBlob(canvas, quality);
      if (blob.size <= maxBytes) {
        return { blob, width: size.width, height: size.height, quality };
      }
    }

    throw new PhotoTooLargeError();
  } finally {
    bitmap.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('This browser cannot encode WebP images.'));
        else if (blob.type !== PHOTO_MIME) reject(new Error('This browser cannot encode WebP images.'));
        else resolve(blob);
      },
      PHOTO_MIME,
      quality,
    );
  });
}
