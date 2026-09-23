'use client';

import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';

/**
 * Submit button of the "create an invitation" form.
 *
 * A plain form bound to a Server Action, so it also works without JavaScript;
 * the only client-side part is the pending label.
 */
export function CreateInvitationButton() {
  const t = useTranslations('dashboard');
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-stone-900 px-5 py-2 text-sm text-stone-50 focus:ring-2 focus:ring-stone-400 focus:outline-none disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
    >
      {pending ? t('actions.creating') : t('actions.create')}
    </button>
  );
}
