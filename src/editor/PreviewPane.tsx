'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PREVIEW_DEVICES, PREVIEW_MESSAGE, type PreviewDeviceId } from './constants';

/**
 * Live preview: the invitation itself, rendered by the server route
 * `/app/[id]/preview` inside an iframe, at a real device width.
 *
 * Why an iframe and not a client-side render? A theme is free to be an async
 * Server Component, to import its own CSS and to run scroll animations on the
 * document; rendering it in a frame keeps its CSS, its fonts and its scrolling
 * away from the editor, and guarantees the couple sees exactly what a guest
 * will. The frame is refreshed by a `postMessage` handled by
 * `PreviewBridge` — no full reload — and falls back to reloading its `src` when
 * the bridge never announced itself.
 *
 * @param refreshKey Bumped by the editor after every successful save.
 */
export function PreviewPane({ src, refreshKey }: { src: string; refreshKey: number }) {
  const t = useTranslations('editor');
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const bridgeReady = useRef(false);
  const lastRefresh = useRef(refreshKey);

  const [device, setDevice] = useState<PreviewDeviceId>('phone');
  const [box, setBox] = useState({ width: 0, height: 0 });

  const deviceSpec = PREVIEW_DEVICES.find((item) => item.id === device) ?? PREVIEW_DEVICES[0];

  /* The iframe announces itself once its bridge is listening. */
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as { type?: string } | null;
      if (data?.type === PREVIEW_MESSAGE.ready) bridgeReady.current = true;
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /* Refresh after a save. */
  useEffect(() => {
    if (refreshKey === lastRefresh.current) return;
    lastRefresh.current = refreshKey;

    const frame = frameRef.current;
    if (!frame) return;

    if (bridgeReady.current && frame.contentWindow) {
      frame.contentWindow.postMessage(
        { type: PREVIEW_MESSAGE.refresh, key: refreshKey },
        window.location.origin,
      );
    } else {
      frame.src = `${src}?v=${refreshKey}`;
    }
  }, [refreshKey, src]);

  /* Scale the device frame down to whatever room the pane has. */
  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setBox({ width: rect.width, height: rect.height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = box.width > 0 ? Math.min(1, box.width / deviceSpec.width) : 1;
  const frameHeight = box.height > 0 ? Math.round(box.height / scale) : deviceSpec.height;

  return (
    <section aria-labelledby="preview-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="preview-title" className="text-lg font-semibold">
          {t('previewPane.title')}
        </h2>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline underline-offset-2"
        >
          {t('previewPane.open')}
        </a>
      </div>

      <div role="group" aria-label={t('previewPane.deviceLabel')} className="flex flex-wrap gap-2">
        {PREVIEW_DEVICES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === device}
            onClick={() => setDevice(item.id)}
            className={`rounded-full border px-3 py-1 text-xs focus:ring-2 focus:ring-stone-400 focus:outline-none ${
              item.id === device
                ? 'border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                : 'border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300'
            }`}
          >
            {t(`previewPane.device.${item.id}`)}
          </button>
        ))}
      </div>

      <div
        ref={boxRef}
        className="h-[60vh] min-h-96 w-full overflow-hidden rounded-xl border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-900"
      >
        {/* The inner box carries the *scaled* width, so the frame stays centred. */}
        <div className="mx-auto h-full" style={{ width: Math.round(deviceSpec.width * scale) }}>
          <iframe
            ref={frameRef}
            src={src}
            title={t('previewPane.frameTitle')}
            className="border-0 bg-white"
            style={{
              width: deviceSpec.width,
              height: frameHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400">{t('previewPane.hint')}</p>
    </section>
  );
}
