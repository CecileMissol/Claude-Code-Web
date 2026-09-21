'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { saveInvitationContentAction, type SaveIssue } from './actions';
import { PreviewPane } from './PreviewPane';
import { StepPanel } from './StepPanel';
import { setAtPath } from './paths';
import type { EditorStep } from './types';
import { issuesByPath, stepsWithIssues, validateDraft } from './validation';
import { useAutosave, type SaveState } from './useAutosave';

/**
 * Root of the editor: steps on one side, live preview on the other.
 *
 * Layout — mobile first: the preview comes first on screen and the form sits
 * below it; from `lg` the form takes the left column and the preview becomes a
 * sticky right column. The DOM order stays form-then-preview so keyboard users
 * reach the fields immediately.
 *
 * Data — the draft lives in React state only: it is validated on every
 * keystroke against the descriptors generated from the theme manifest, saved
 * 800 ms after the last change through a Server Action, and never written to
 * `localStorage`. Leaving the page with an unsaved change asks for
 * confirmation, and hiding the tab flushes the pending save.
 */
export function EditorShell({
  invitationId,
  initialContent,
  steps,
  locale,
  previewSrc,
}: {
  invitationId: string;
  initialContent: Record<string, unknown>;
  steps: EditorStep[];
  locale: Locale;
  previewSrc: string;
}) {
  const t = useTranslations('editor');

  const [content, setContent] = useState<Record<string, unknown>>(initialContent);
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id ?? 'couple');
  const [serverIssues, setServerIssues] = useState<SaveIssue[]>([]);

  const issues = useMemo(() => validateDraft(steps, content), [steps, content]);
  const issueMap = useMemo(() => issuesByPath(issues), [issues]);
  const flaggedSteps = useMemo(() => stepsWithIssues(steps, content), [steps, content]);

  const save = useCallback(
    async (value: Record<string, unknown>) => {
      const result = await saveInvitationContentAction(invitationId, value);
      if (!result.ok) {
        setServerIssues(result.issues ?? []);
        throw new Error(result.error);
      }
      setServerIssues([]);
    },
    [invitationId],
  );

  const autosave = useAutosave({ value: content, save, canSave: issues.length === 0 });

  const update = useCallback((path: string, value: unknown) => {
    setContent((current) => setAtPath(current, path, value));
  }, []);

  /* Nothing is lost on the way out. */
  useEffect(() => {
    if (!autosave.hasUnsaved) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [autosave.hasUnsaved]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') void autosave.flush();
    };

    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [autosave]);

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId),
  );
  const activeStep = steps[activeIndex];

  return (
    // Breaks out of the 3xl application container without ever overflowing the
    // viewport (the 2rem keeps room for a visible scrollbar).
    <div className="relative left-1/2 w-[min(calc(100vw-2rem),80rem)] -translate-x-1/2">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">{t('intro')}</p>
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator state={autosave.state} />
          <Link
            href="/app"
            onClick={() => void autosave.flush()}
            className="rounded-full border border-stone-300 px-4 py-1.5 text-sm dark:border-stone-700"
          >
            {t('actions.backToDashboard')}
          </Link>
        </div>
      </div>

      {serverIssues.length > 0 && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {t('errors.invalid')}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form — second on mobile, first on desktop. */}
        <div className="order-2 lg:order-1">
          <nav aria-label={t('stepsLabel')} className="mb-4 -mx-1 overflow-x-auto">
            <ul className="flex gap-1 px-1 pb-1">
              {steps.map((step, index) => {
                const current = step.id === activeStepId;
                const flagged = flaggedSteps.has(step.id);

                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      aria-current={current ? 'step' : undefined}
                      onClick={() => setActiveStepId(step.id)}
                      className={`rounded-full px-3 py-1.5 text-xs whitespace-nowrap focus:ring-2 focus:ring-stone-400 focus:outline-none ${
                        current
                          ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      <span className="mr-1 tabular-nums opacity-60">{index + 1}</span>
                      {t(step.labelKey)}
                      {flagged && (
                        <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden="true">
                          ●
                        </span>
                      )}
                      {flagged && <span className="sr-only">{t('stepHasErrors')}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <p className="mb-3 text-xs text-stone-500">
            {t('stepPosition', { current: activeIndex + 1, total: steps.length })}
          </p>

          {activeStep && (
            <StepPanel
              step={activeStep}
              content={content}
              onChange={update}
              issues={issueMap}
              locale={locale}
              invitationId={invitationId}
            />
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => setActiveStepId(steps[activeIndex - 1]?.id ?? activeStepId)}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm disabled:opacity-40 dark:border-stone-700"
            >
              {t('actions.previous')}
            </button>
            <button
              type="button"
              disabled={activeIndex >= steps.length - 1}
              onClick={() => setActiveStepId(steps[activeIndex + 1]?.id ?? activeStepId)}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm disabled:opacity-40 dark:border-stone-700"
            >
              {t('actions.next')}
            </button>
          </div>
        </div>

        {/* Preview — first on mobile, sticky right column on desktop. */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-4">
            <PreviewPane src={previewSrc} refreshKey={autosave.savedCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * "Saved / Saving… / Error" badge.
 * Announced politely, so a screen reader hears the outcome without being
 * interrupted on every keystroke.
 */
function SaveIndicator({ state }: { state: SaveState }) {
  const t = useTranslations('editor');

  const tone: Record<SaveState, string> = {
    idle: 'text-stone-500',
    dirty: 'text-stone-500',
    saving: 'text-stone-500',
    saved: 'text-emerald-700 dark:text-emerald-400',
    error: 'text-red-700 dark:text-red-400',
    invalid: 'text-amber-700 dark:text-amber-400',
  };

  return (
    <p
      aria-live="polite"
      aria-label={t('status.label')}
      className={`text-xs font-medium ${tone[state]}`}
    >
      {t(`status.${state}`)}
    </p>
  );
}
