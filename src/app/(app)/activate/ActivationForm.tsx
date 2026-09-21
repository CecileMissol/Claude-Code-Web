'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { submitActivationAction, type ActivationFormState } from './actions';

const INITIAL_STATE: ActivationFormState = { status: 'idle' };

export interface ActivationThemeOption {
  slug: string;
  name: string;
}

/**
 * Activation request form: order number + email + purchased theme + consent.
 * Bound to a Server Action via the native `action` prop, so it degrades to a
 * plain POST without client JavaScript — only the pending/error states need
 * the hook.
 */
export function ActivationForm({ themes }: { themes: ActivationThemeOption[] }) {
  const t = useTranslations('auth');
  const [state, formAction, pending] = useActionState<ActivationFormState, FormData>(
    submitActivationAction,
    INITIAL_STATE,
  );

  if (state.status === 'success' || state.status === 'reopened') {
    return (
      <div
        data-testid="activation-confirmation"
        className="rounded-lg border border-stone-300 p-4 dark:border-stone-700"
      >
        <h2 className="font-medium">{t('activate.confirmation.title')}</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {t('activate.confirmation.body')}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <label className="block space-y-1">
        <span className="text-sm">{t('activate.orderLabel')}</span>
        <input
          type="text"
          name="etsyOrderId"
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder={t('activate.orderPlaceholder')}
          className="w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
        />
        {state.fieldErrors?.etsyOrderId && (
          <p className="text-sm text-red-600">{t('activate.errors.orderId')}</p>
        )}
      </label>

      <label className="block space-y-1">
        <span className="text-sm">{t('activate.emailLabel')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('activate.emailPlaceholder')}
          className="w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
        />
        {state.fieldErrors?.email && <p className="text-sm text-red-600">{t('activate.errors.email')}</p>}
      </label>

      <label className="block space-y-1">
        <span className="text-sm">{t('activate.themeLabel')}</span>
        <select
          name="themeSlug"
          required
          defaultValue={themes[0]?.slug}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
        >
          {themes.map((theme) => (
            <option key={theme.slug} value={theme.slug}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>{t('activate.consentLabel')}</span>
      </label>
      <p className="text-xs text-stone-500">
        <Link href="/legal/terms" className="underline">
          {t('activate.termsLink')}
        </Link>
        {' · '}
        <Link href="/legal/privacy" className="underline">
          {t('activate.privacyLink')}
        </Link>
      </p>
      {state.fieldErrors?.consent && <p className="text-sm text-red-600">{t('activate.errors.consent')}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-stone-900 px-5 py-2 text-sm text-stone-50 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
      >
        {pending ? t('activate.submitting') : t('activate.submit')}
      </button>

      {state.status === 'duplicate-pending' && (
        <p role="alert" className="text-sm text-amber-700 dark:text-amber-500">
          {t('activate.errors.duplicatePending')}
        </p>
      )}
      {state.status === 'duplicate-approved' && (
        <p role="alert" className="text-sm text-amber-700 dark:text-amber-500">
          {t('activate.errors.duplicateApproved')}
        </p>
      )}
      {state.status === 'rate-limited' && (
        <p role="alert" className="text-sm text-red-600">
          {t('activate.errors.rateLimited')}
        </p>
      )}
      {(state.status === 'error' || (state.status === 'invalid' && !state.fieldErrors)) && (
        <p role="alert" className="text-sm text-red-600">
          {t('activate.errors.generic')}
        </p>
      )}
    </form>
  );
}
