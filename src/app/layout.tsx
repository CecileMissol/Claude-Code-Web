import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: { default: t('appName'), template: `%s · ${t('appName')}` },
    description: t('tagline'),
  };
}

/**
 * Root layout.
 * There is no `[locale]` segment: the interface locale comes from the `locale`
 * cookie (see `src/i18n/locale.ts`), so every URL stays language-neutral.
 * The published invitation overrides `lang` on its own root element, because
 * it is rendered in the language the couple chose, not the visitor's.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
