'use client';

import { useCallback, useState } from 'react';

/**
 * QR code block.
 *
 * The SVG comes from `/api/qr/[slug]` — rendered by the `qrcode` library on the
 * server, so it is identical to what a printer receives. The PNG is produced
 * here: the same SVG is drawn into a canvas at the requested size and exported
 * with `toBlob`. That keeps every image encoder out of the Worker, which has
 * neither `node-canvas` nor `sharp`.
 */
export function QrDownloads({
  svgUrl,
  fileName,
  size,
  labels,
}: {
  /** `/api/qr/zoe-et-dylan` */
  svgUrl: string;
  /** Base name of the downloaded files, without extension. */
  fileName: string;
  /** Edge of the exported PNG, in pixels. */
  size: number;
  labels: { alt: string; downloadSvg: string; downloadPng: string; pngSize: string };
}) {
  const [busy, setBusy] = useState(false);

  const downloadPng = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch(`${svgUrl}?size=${size}`);
      if (!response.ok) return;

      const svg = await response.text();
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const image = new Image();
      image.width = size;
      image.height = size;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('svg failed to load'));
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const png: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((result) => resolve(result), 'image/png'),
      );
      if (!png) return;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      // A failed export must not break the page; the SVG link still works.
    } finally {
      setBusy(false);
    }
  }, [svgUrl, size, fileName]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${svgUrl}?size=256`}
        alt={labels.alt}
        width={160}
        height={160}
        className="rounded-md border border-stone-200 bg-white p-2 dark:border-stone-700"
      />

      <div className="flex flex-col gap-2">
        <a
          href={`${svgUrl}?size=1024&download=1`}
          download={`${fileName}.svg`}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-center text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          {labels.downloadSvg}
        </a>
        <button
          type="button"
          onClick={downloadPng}
          disabled={busy}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          {labels.downloadPng}
        </button>
        <span className="text-xs text-stone-500">{labels.pngSize}</span>
      </div>
    </div>
  );
}
