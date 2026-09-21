import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/LoginForm';
import { getSession } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('login.title') };
}

/** `/login` — passwordless sign-in: email in, magic link out. */
export default async function LoginPage() {
  const sessionUser = await safeSession();
  if (sessionUser) redirect('/app');

  const t = await getTranslations('auth');

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('login.title')}</h1>
      <p className="text-stone-600 dark:text-stone-400">{t('login.intro')}</p>
      <LoginForm />
    </section>
  );
}

async function safeSession() {
  try {
    return await getSession();
  } catch {
    return null;
  }
}
