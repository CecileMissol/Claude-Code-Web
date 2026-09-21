import type { Locale } from '@/i18n/config';
import type { InvitationStatus } from '@/db/schema';

/**
 * Sober page shown when a link is real but the invitation is no longer served:
 * the hosting window closed (`expired`) or the couple took it offline
 * (`disabled`).
 *
 * The copy is translated with the invitation's own locale, not the visitor's
 * cookie, exactly like the invitation it replaces. It lives here rather than in
 * `src/messages/` because this page renders outside the application shell and
 * outside `NextIntlClientProvider`'s namespace: it never reads the visitor's
 * language, so it must not read the visitor's message bundle either.
 */

export interface UnavailableCopy {
  locale: Locale;
  title: string;
  body: string;
}

const COPY: Record<Locale, Record<'expired' | 'disabled', { title: string; body: string }>> = {
  fr: {
    expired: {
      title: "Cette invitation n'est plus disponible",
      body: "La période pendant laquelle elle était en ligne est terminée. Si vous cherchez une information sur l'événement, contactez directement les mariés.",
    },
    disabled: {
      title: "Cette invitation n'est plus disponible",
      body: "Elle a été mise hors ligne par les mariés. Si vous cherchez une information sur l'événement, contactez-les directement.",
    },
  },
  en: {
    expired: {
      title: 'This invitation is no longer available',
      body: 'The period during which it was online has ended. If you are looking for information about the event, please contact the couple directly.',
    },
    disabled: {
      title: 'This invitation is no longer available',
      body: 'The couple have taken it offline. If you are looking for information about the event, please contact them directly.',
    },
  },
};

/** Picks the right copy for a locale and a status. */
export function unavailableCopy(locale: Locale, status: InvitationStatus): UnavailableCopy {
  const table = COPY[locale] ?? COPY.en;
  const entry = status === 'disabled' ? table.disabled : table.expired;
  return { locale, ...entry };
}

export function Unavailable({ copy }: { copy: UnavailableCopy }) {
  return (
    <main
      lang={copy.locale}
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem 1rem',
        backgroundColor: '#f6f5f2',
        color: '#1c1917',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
          {copy.title}
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#57534e' }}>{copy.body}</p>
      </div>
    </main>
  );
}
