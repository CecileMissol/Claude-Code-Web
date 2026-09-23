'use client';

/**
 * Delete button for one reply.
 *
 * The form and its server action come from the server component; this wrapper
 * only adds the confirmation, because deleting a guest's answer cannot be
 * undone. With JavaScript disabled the submit still works — one click instead
 * of two, which is the right trade-off for a page that must stay usable.
 */
export function DeleteReplyButton({
  label,
  confirmLabel,
}: {
  label: string;
  confirmLabel: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmLabel)) event.preventDefault();
      }}
      className="text-xs text-red-700 underline dark:text-red-400"
    >
      {label}
    </button>
  );
}
