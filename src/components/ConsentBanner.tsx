'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const COOKIE_NAME = 'consent_seen';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function hasSeenNotice(): boolean {
  try {
    return document.cookie.split('; ').some((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  } catch {
    // Cookies unavailable (private mode, blocked storage): don't nag on every
    // render, just skip the banner.
    return true;
  }
}

// Read through `useSyncExternalStore` rather than `useState` + `useEffect`:
// the cookie is an external mutable source read only in the browser, and this
// avoids setting state as a side effect of rendering.
let listeners: Array<() => void> = [];
function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((entry) => entry !== listener);
  };
}
function notify(): void {
  for (const listener of listeners) listener();
}
function getSnapshot(): boolean {
  return hasSeenNotice();
}
/** Nothing is knowable about the cookie during SSR: render as "already seen". */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Personal-data information banner — not a tracking-consent prompt.
 *
 * The application sets no advertising or audience-measurement cookie, so
 * there is nothing to opt in or out of: this only *informs* the visitor once,
 * with a link to the privacy policy, and remembers that with a technical
 * (strictly necessary, non-tracking) cookie — never `localStorage`.
 */
export function ConsentBanner() {
  const t = useTranslations('common');
  const seen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (seen) return null;

  function dismiss() {
    try {
      document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    } catch {
      // Nothing to persist; the banner just reappears next visit.
    }
    notify();
  }

  return (
    <div
      role="region"
      aria-label={t('consent.title')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {t('consent.body')}{' '}
          <Link href="/legal/privacy" className="underline">
            {t('consent.link')}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full bg-stone-900 px-4 py-1.5 text-sm text-stone-50 dark:bg-stone-100 dark:text-stone-900"
        >
          {t('consent.dismiss')}
        </button>
      </div>
    </div>
  );
}
