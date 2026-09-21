'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PREVIEW_MESSAGE } from './constants';

/**
 * Lives inside the preview iframe and refreshes it on demand.
 *
 * The theme root may be an async Server Component (it loads its own messages),
 * so the preview is rendered by a real server route rather than in the editor's
 * client bundle. When the editor has saved, it posts
 * `invitation-preview:refresh`; this bridge answers with `router.refresh()`,
 * which re-runs the server render and swaps the result in without reloading the
 * document — the scroll position and any running animation survive.
 *
 * The editor falls back to reloading the iframe if it never receives the
 * `invitation-preview:ready` handshake (JavaScript disabled, bridge crashed).
 */
export function PreviewBridge() {
  const router = useRouter();

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string } | null;
      if (data?.type === PREVIEW_MESSAGE.refresh) router.refresh();
    }

    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: PREVIEW_MESSAGE.ready }, window.location.origin);

    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  return null;
}
