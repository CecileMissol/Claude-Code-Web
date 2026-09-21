import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';

/**
 * "You have a new reply" e-mail, sent to the couple when a guest answers.
 *
 * This is a React Email template in the plain sense of the term: a React
 * component made of table-free block elements with inline styles, which is what
 * `@react-email/components` compiles down to. That package is deliberately NOT
 * a dependency of this phase (the brief limits new packages to `qrcode`), so
 * the markup is written out and rendered by `renderRsvpNotification()` below
 * rather than by `@react-email/render`. Swapping in the real renderer later is
 * a one-file change.
 */

export interface RsvpNotificationProps {
  locale: Locale;
  /** "Zoé & Dylan" */
  names: string;
  guestName: string;
  attending: boolean;
  guests: number;
  email?: string | null;
  diet?: string | null;
  message?: string | null;
  /** Link to `/app/[id]/responses`. */
  dashboardUrl: string;
  /** Running totals after this reply. */
  totals?: { yes: number; no: number; people: number };
}

const COPY = {
  fr: {
    subject: (guest: string, attending: boolean) =>
      attending ? `${guest} sera là` : `${guest} ne pourra pas venir`,
    preheader: 'Nouvelle réponse à votre invitation',
    heading: 'Nouvelle réponse',
    intro: (names: string) => `Une réponse vient d'arriver sur l'invitation de ${names}.`,
    attendingYes: 'Présent(e)',
    attendingNo: 'Absent(e)',
    fields: {
      name: 'Nom',
      attending: 'Réponse',
      guests: 'Personnes',
      email: 'E-mail',
      diet: 'Régime alimentaire',
      message: 'Message',
    },
    totals: (yes: number, no: number, people: number) =>
      `Total : ${yes} oui · ${no} non · ${people} personne(s) attendue(s).`,
    cta: 'Voir toutes les réponses',
    footer:
      'Vous recevez cet e-mail parce que la notification est activée sur cette invitation. Vous pouvez la désactiver depuis la page des réponses.',
  },
  en: {
    subject: (guest: string, attending: boolean) =>
      attending ? `${guest} is coming` : `${guest} cannot make it`,
    preheader: 'New reply to your invitation',
    heading: 'New reply',
    intro: (names: string) => `A reply just landed on ${names}'s invitation.`,
    attendingYes: 'Attending',
    attendingNo: 'Not attending',
    fields: {
      name: 'Name',
      attending: 'Reply',
      guests: 'People',
      email: 'Email',
      diet: 'Dietary requirements',
      message: 'Message',
    },
    totals: (yes: number, no: number, people: number) =>
      `Totals: ${yes} yes · ${no} no · ${people} people expected.`,
    cta: 'See every reply',
    footer:
      'You receive this email because notifications are on for this invitation. You can turn them off from the responses page.',
  },
} as const;

const styles = {
  body: {
    margin: 0,
    padding: '24px',
    backgroundColor: '#f6f5f2',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    color: '#1c1917',
  },
  card: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '28px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
  },
  heading: { margin: '0 0 8px', fontSize: '20px', fontWeight: 600 },
  intro: { margin: '0 0 20px', fontSize: '15px', lineHeight: '22px', color: '#57534e' },
  row: { margin: '0 0 10px', fontSize: '15px', lineHeight: '22px' },
  label: { display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#78716c' },
  totals: { margin: '20px 0 0', fontSize: '14px', color: '#57534e' },
  button: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '11px 18px',
    backgroundColor: '#1c1917',
    color: '#ffffff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
  },
  footer: { margin: '22px 0 0', fontSize: '12px', lineHeight: '18px', color: '#a8a29e' },
} as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p style={styles.row}>
      <span style={styles.label as CSSProperties}>{label}</span>
      <span>{value}</span>
    </p>
  );
}

/** The template itself. */
export function RsvpNotification(props: RsvpNotificationProps) {
  const t = COPY[props.locale] ?? COPY.en;
  const attending = props.attending ? t.attendingYes : t.attendingNo;

  return (
    <html lang={props.locale}>
      <body style={styles.body}>
        <div style={styles.card}>
          <h1 style={styles.heading}>{t.heading}</h1>
          <p style={styles.intro}>{t.intro(props.names)}</p>

          <Field label={t.fields.name} value={props.guestName} />
          <Field label={t.fields.attending} value={attending} />
          {props.attending && <Field label={t.fields.guests} value={String(props.guests)} />}
          {props.email ? <Field label={t.fields.email} value={props.email} /> : null}
          {props.diet ? <Field label={t.fields.diet} value={props.diet} /> : null}
          {props.message ? <Field label={t.fields.message} value={props.message} /> : null}

          {props.totals && (
            <p style={styles.totals}>
              {t.totals(props.totals.yes, props.totals.no, props.totals.people)}
            </p>
          )}

          <p>
            <a href={props.dashboardUrl} style={styles.button}>
              {t.cta}
            </a>
          </p>

          <p style={styles.footer}>{t.footer}</p>
        </div>
      </body>
    </html>
  );
}

export default RsvpNotification;

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      const unit =
        typeof value === 'number' && value !== 0 && property !== 'font-weight' ? 'px' : '';
      return `${property}:${value}${unit}`;
    })
    .join(';');
}

/** Plain-text part — always sent, and the only part a text-only client sees. */
export function rsvpNotificationText(props: RsvpNotificationProps): string {
  const t = COPY[props.locale] ?? COPY.en;
  const lines = [
    t.intro(props.names),
    '',
    `${t.fields.name}: ${props.guestName}`,
    `${t.fields.attending}: ${props.attending ? t.attendingYes : t.attendingNo}`,
  ];

  if (props.attending) lines.push(`${t.fields.guests}: ${props.guests}`);
  if (props.email) lines.push(`${t.fields.email}: ${props.email}`);
  if (props.diet) lines.push(`${t.fields.diet}: ${props.diet}`);
  if (props.message) lines.push(`${t.fields.message}: ${props.message}`);

  if (props.totals) {
    lines.push('', t.totals(props.totals.yes, props.totals.no, props.totals.people));
  }

  lines.push('', `${t.cta}: ${props.dashboardUrl}`, '', t.footer);
  return lines.join('\n');
}

/**
 * Renders the template to the `{ subject, text, html }` triple `sendMail()`
 * expects. The HTML mirrors {@link RsvpNotification} exactly; it is produced by
 * hand rather than by `react-dom/server` so the Worker never has to pull a
 * React renderer into its bundle just to send an e-mail.
 */
export function renderRsvpNotification(props: RsvpNotificationProps): {
  subject: string;
  text: string;
  html: string;
} {
  const t = COPY[props.locale] ?? COPY.en;

  const field = (label: string, value: string) =>
    `<p style="${inline(styles.row)}"><span style="${inline(styles.label)}">${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></p>`;

  const rows = [
    field(t.fields.name, props.guestName),
    field(t.fields.attending, props.attending ? t.attendingYes : t.attendingNo),
    props.attending ? field(t.fields.guests, String(props.guests)) : '',
    props.email ? field(t.fields.email, props.email) : '',
    props.diet ? field(t.fields.diet, props.diet) : '',
    props.message ? field(t.fields.message, props.message) : '',
  ].join('');

  const totals = props.totals
    ? `<p style="${inline(styles.totals)}">${escapeHtml(t.totals(props.totals.yes, props.totals.no, props.totals.people))}</p>`
    : '';

  const html = [
    '<!doctype html>',
    `<html lang="${props.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(t.preheader)}</title></head>`,
    `<body style="${inline(styles.body)}">`,
    `<div style="${inline(styles.card)}">`,
    `<h1 style="${inline(styles.heading)}">${escapeHtml(t.heading)}</h1>`,
    `<p style="${inline(styles.intro)}">${escapeHtml(t.intro(props.names))}</p>`,
    rows,
    totals,
    `<p><a href="${escapeHtml(props.dashboardUrl)}" style="${inline(styles.button)}">${escapeHtml(t.cta)}</a></p>`,
    `<p style="${inline(styles.footer)}">${escapeHtml(t.footer)}</p>`,
    '</div></body></html>',
  ].join('');

  return {
    subject: t.subject(props.guestName, props.attending),
    text: rsvpNotificationText(props),
    html,
  };
}
