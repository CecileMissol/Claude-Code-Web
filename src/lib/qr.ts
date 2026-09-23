import QRCode from 'qrcode';

/**
 * QR codes.
 *
 * The SVG is rendered on the server (`qrcode`'s `toString`), which is the form
 * the couple wants for print: it scales without ever pixelating. The PNG is
 * produced in the browser by drawing that same SVG onto a canvas
 * (`src/app/(app)/app/[id]/share/QrDownloads.tsx`), so no image encoder has to
 * run inside the Worker.
 */

/** Default edge of the rendered SVG, in CSS pixels. */
export const QR_DEFAULT_SIZE = 512;

/** Smallest and largest size accepted by `/api/qr/[slug]`. */
export const QR_MIN_SIZE = 128;
export const QR_MAX_SIZE = 2048;

export interface QrOptions {
  /** Edge of the square, in pixels. */
  size?: number;
  /** Quiet zone, in modules. Four is the value the specification asks for. */
  margin?: number;
  dark?: string;
  light?: string;
}

/** Clamps a requested size to the accepted range. */
export function clampQrSize(value: number | null | undefined): number {
  if (!value || !Number.isFinite(value)) return QR_DEFAULT_SIZE;
  return Math.min(QR_MAX_SIZE, Math.max(QR_MIN_SIZE, Math.round(value)));
}

/**
 * Renders `text` as an SVG document.
 *
 * Error correction is set to `M`: it survives a printed card being folded or
 * lightly marked without inflating the module count.
 */
export function qrSvg(text: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    width: clampQrSize(options.size),
    margin: options.margin ?? 4,
    color: {
      dark: options.dark ?? '#111111',
      light: options.light ?? '#ffffff',
    },
  });
}

/** `zoe-et-dylan-qr.svg` */
export function qrFileName(slug: string, extension: 'svg' | 'png'): string {
  return `${slug}-qr.${extension}`;
}
