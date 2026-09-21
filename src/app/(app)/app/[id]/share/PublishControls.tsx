'use client';

import { useActionState } from 'react';
import { publishAction, unpublishAction } from './actions';

/**
 * Publish / take offline. Two one-button forms rather than a toggle: the label
 * always states what the click will do, which is what the couple needs before
 * putting their wedding on the open web.
 */
export function PublishControls({
  invitationId,
  online,
  everPublished,
  canPublish,
  labels,
}: {
  invitationId: string;
  online: boolean;
  everPublished: boolean;
  /** False while no valid link has been chosen. */
  canPublish: boolean;
  labels: {
    publish: string;
    republish: string;
    unpublish: string;
    unpublishHelp: string;
    confirm: string;
    /** Shown under the disabled button when no link has been saved yet. */
    needsLink: string;
    problems: Record<string, string>;
  };
}) {
  const [publishState, publish, publishing] = useActionState(publishAction, null);
  const [unpublishState, unpublish, unpublishing] = useActionState(unpublishAction, null);

  const problem = publishState?.problem ?? unpublishState?.problem;

  return (
    <div className="space-y-3">
      {online ? (
        <form action={unpublish} className="space-y-2">
          <input type="hidden" name="id" value={invitationId} />
          <button
            type="submit"
            disabled={unpublishing}
            onClick={(event) => {
              if (!window.confirm(labels.confirm)) event.preventDefault();
            }}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            {labels.unpublish}
          </button>
          <p className="text-xs text-stone-500">{labels.unpublishHelp}</p>
        </form>
      ) : (
        <form action={publish}>
          <input type="hidden" name="id" value={invitationId} />
          <button
            type="submit"
            disabled={publishing || !canPublish}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
          >
            {everPublished ? labels.republish : labels.publish}
          </button>
          {!canPublish && <p className="mt-2 text-xs text-stone-500">{labels.needsLink}</p>}
        </form>
      )}

      {problem && (
        <p className="text-sm text-red-700 dark:text-red-400" aria-live="polite">
          {labels.problems[problem] ?? labels.problems.server}
        </p>
      )}
    </div>
  );
}
