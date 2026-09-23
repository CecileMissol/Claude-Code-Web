'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Magic-link sign-in form.
 * The same message is shown whether or not the address is known, so the form
 * cannot be used to probe which emails have an account.
 */
export function LoginForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');

    const { error } = await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL: '/app',
    });

    setStatus(error ? 'error' : 'sent');
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-stone-300 p-4 dark:border-stone-700">
        <h2 className="font-medium">{t('login.sentTitle')}</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {t('login.sentBody', { email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <label className="block space-y-1">
        <span className="text-sm">{t('login.emailLabel')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-stone-300 px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
        />
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full bg-stone-900 px-5 py-2 text-sm text-stone-50 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
      >
        {status === 'sending' ? t('login.submitting') : t('login.submit')}
      </button>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {t('login.error')}
        </p>
      )}
    </form>
  );
}
