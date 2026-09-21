'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { authClient } from '@/lib/auth-client';

/** Ends the session and sends the visitor back to the home page. */
export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        void authClient.signOut().then(() => {
          startTransition(() => {
            router.replace('/');
            router.refresh();
          });
        });
      }}
      className="rounded-full border border-stone-300 px-4 py-1.5 text-sm disabled:opacity-60 dark:border-stone-700"
    >
      {label}
    </button>
  );
}
