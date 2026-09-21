'use client';

import { useActionState, useEffect, useId, useRef, useState, useTransition } from 'react';
import { checkSlugAction, saveSlugAction, suggestSlugAction } from './actions';
import type { SlugCheckResult } from './actions';

/**
 * Link picker: normalises what the couple types, checks availability while they
 * type (debounced, through a server action), and saves it.
 *
 * It degrades gracefully: with JavaScript off the field is a plain input inside
 * a form, the server re-validates everything, and the answer comes back on the
 * next render.
 */

export interface SlugFieldLabels {
  label: string;
  help: string;
  placeholder: string;
  suggest: string;
  save: string;
  saved: string;
  checking: string;
  available: string;
  locked: string;
  problems: Record<string, string>;
}

const DEBOUNCE_MS = 350;

export function SlugField({
  invitationId,
  initialSlug,
  origin,
  locked,
  labels,
}: {
  invitationId: string;
  initialSlug: string;
  /** `https://domain.tld`, shown as a static prefix before the field. */
  origin: string;
  /** True once the invitation is online: the link is frozen. */
  locked: boolean;
  labels: SlugFieldLabels;
}) {
  const fieldId = useId();
  const [value, setValue] = useState(initialSlug);
  const [check, setCheck] = useState<SlugCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [pendingSuggestion, startSuggestion] = useTransition();
  const [state, formAction, saving] = useActionState(saveSlugAction, null);
  const latest = useRef(0);

  /**
   * Every change resets the verdict and, when there is something to check,
   * turns the indicator on. Doing it here rather than in the effect keeps the
   * effect free of synchronous state updates (and of cascading renders).
   */
  function updateValue(next: string) {
    setValue(next);
    setCheck(null);
    setChecking(!locked && next !== initialSlug);
  }

  useEffect(() => {
    if (locked || value === initialSlug) return;

    const token = ++latest.current;

    const timeout = setTimeout(() => {
      checkSlugAction(invitationId, value)
        .then((result) => {
          if (token !== latest.current) return;
          setCheck(result);
        })
        .catch(() => {
          if (token === latest.current) setCheck(null);
        })
        .finally(() => {
          if (token === latest.current) setChecking(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, initialSlug, invitationId, locked]);

  const problem = state?.problem ?? check?.problem;
  const message = checking
    ? labels.checking
    : problem
      ? (labels.problems[problem] ?? labels.problems.server)
      : state?.ok
        ? labels.saved
        : check?.available
          ? labels.available
          : null;

  const tone = problem ? 'text-red-700 dark:text-red-400' : 'text-stone-600 dark:text-stone-400';

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={invitationId} />

      <label htmlFor={fieldId} className="block text-sm font-medium">
        {labels.label}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-500">{origin}/</span>
        <input
          id={fieldId}
          name="slug"
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          placeholder={labels.placeholder}
          disabled={locked}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900"
        />
      </div>

      <p className="text-xs text-stone-500">{locked ? labels.locked : labels.help}</p>

      {message && (
        <p className={`text-sm ${tone}`} aria-live="polite">
          {message}
        </p>
      )}

      {!locked && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
          >
            {labels.save}
          </button>
          <button
            type="button"
            disabled={pendingSuggestion}
            onClick={() =>
              startSuggestion(async () => {
                const suggestion = await suggestSlugAction(invitationId);
                if (suggestion) updateValue(suggestion);
              })
            }
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            {labels.suggest}
          </button>
        </div>
      )}
    </form>
  );
}
