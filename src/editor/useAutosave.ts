'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AUTOSAVE_DELAY_MS } from './constants';

/**
 * Debounced automatic saving.
 *
 * Nothing is ever kept in `localStorage`: the draft lives in React state and in
 * the database, and every change is pushed {@link AUTOSAVE_DELAY_MS} ms after
 * the couple stops typing. A save in flight never blocks typing — the latest
 * value is kept and sent again as soon as the previous request returns.
 *
 * States: `idle` (nothing saved yet, nothing to save) → `dirty` (waiting for
 * the debounce) → `saving` → `saved`, plus `invalid` (client-side validation
 * holds the change back) and `error` (the server refused; the change stays in
 * memory and is retried on the next edit or on {@link AutosaveHandle.flush}).
 */

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'invalid';

export interface AutosaveHandle {
  state: SaveState;
  lastSavedAt: Date | null;
  /** Increments on every successful save; used to refresh the preview. */
  savedCount: number;
  /** True while the browser holds changes the server does not have. */
  hasUnsaved: boolean;
  /** Saves immediately, skipping the debounce (navigation, tab hidden…). */
  flush: () => Promise<void>;
}

export interface AutosaveOptions<T> {
  value: T;
  /** Persists the value; rejecting puts the hook in the `error` state. */
  save: (value: T) => Promise<void>;
  /** When false, the value is held back instead of being sent. */
  canSave?: boolean;
  delay?: number;
}

export function useAutosave<T>({
  value,
  save,
  canSave = true,
  delay = AUTOSAVE_DELAY_MS,
}: AutosaveOptions<T>): AutosaveHandle {
  /** Last value the server acknowledged; compared by reference. */
  const [savedValue, setSavedValue] = useState<T>(value);
  const [phase, setPhase] = useState<'ready' | 'saving' | 'error'>('ready');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const latest = useRef(value);
  const persisted = useRef(savedValue);
  const saveRef = useRef(save);
  const canSaveRef = useRef(canSave);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Mirrors, read by the asynchronous save; kept out of the render pass. */
  useEffect(() => {
    latest.current = value;
    persisted.current = savedValue;
    saveRef.current = save;
    canSaveRef.current = canSave;
  });

  const run = useCallback(async () => {
    if (inFlight.current) return;
    if (latest.current === persisted.current) return;
    if (!canSaveRef.current) return;

    const target = latest.current;
    inFlight.current = true;
    setPhase('saving');

    try {
      await saveRef.current(target);
      persisted.current = target;
      setSavedValue(target);
      setLastSavedAt(new Date());
      setSavedCount((count) => count + 1);
      setPhase('ready');
    } catch {
      setPhase('error');
    } finally {
      inFlight.current = false;
    }
  }, []);

  const dirty = value !== savedValue;

  useEffect(() => {
    if (!dirty || !canSave) return;

    timer.current = setTimeout(() => void run(), delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [dirty, canSave, delay, run, value]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await run();
  }, [run]);

  const state: SaveState =
    phase === 'saving'
      ? 'saving'
      : phase === 'error'
        ? 'error'
        : dirty
          ? canSave
            ? 'dirty'
            : 'invalid'
          : savedCount > 0
            ? 'saved'
            : 'idle';

  return {
    state,
    lastSavedAt,
    savedCount,
    hasUnsaved: dirty || phase === 'saving' || phase === 'error',
    flush,
  };
}
