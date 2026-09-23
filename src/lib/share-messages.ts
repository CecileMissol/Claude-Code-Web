import type { Locale } from '@/i18n/config';
import type { InvitationContent } from '@/content/schema';
import { longDate } from '@/content/derived';

/**
 * Ready-to-send messages the couple copies into SMS, e-mail or WhatsApp.
 *
 * They are product copy, not interface copy: they are written in the language
 * of the *invitation* (`content.locale`), and the couple can switch language on
 * the share page, so both variants are always available. Keeping them here
 * (rather than in `src/messages/`) means a single template holds both the text
 * and the `sms:` / `mailto:` / `wa.me` link that carries it.
 */

export const SHARE_CHANNELS = ['sms', 'email', 'whatsapp'] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export interface ShareContext {
  /** "Zoé & Dylan" */
  names: string;
  /** Long, localised date: "Samedi 12 juin 2027". */
  date: string;
  /** Public invitation URL. */
  url: string;
  /** Venue city, when the couple filled it in. */
  city?: string;
}

export interface ShareMessage {
  channel: ShareChannel;
  /** Only e-mail has one. */
  subject?: string;
  body: string;
  /** `sms:` / `mailto:` / `https://wa.me/?text=` link carrying the message. */
  href: string;
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                  */
/* -------------------------------------------------------------------------- */

type Template = (context: ShareContext) => { subject?: string; body: string };

const TEMPLATES: Record<Locale, Record<ShareChannel, Template>> = {
  fr: {
    sms: ({ names, date, url }) => ({
      body: `${names} vous invitent ! Rendez-vous le ${date}. Tout est ici : ${url}`,
    }),
    email: ({ names, date, url, city }) => ({
      subject: `${names} — réservez la date du ${date}`,
      body: [
        'Bonjour,',
        '',
        `Nous nous marions le ${date}${city ? ` à ${city}` : ''}.`,
        '',
        'Nous avons préparé une invitation en ligne : ouvrez-la, faites-la défiler, et répondez-nous directement depuis la page.',
        url,
        '',
        'Nous serions très heureux de vous compter parmi nous.',
        '',
        names,
      ].join('\n'),
    }),
    whatsapp: ({ names, date, url }) => ({
      body: [
        `On se marie le ${date} !`,
        '',
        `Voici notre invitation : ${url}`,
        '',
        `Répondez-nous directement depuis la page. À très vite — ${names}`,
      ].join('\n'),
    }),
  },
  en: {
    sms: ({ names, date, url }) => ({
      body: `${names} are getting married on ${date}. Everything is here: ${url}`,
    }),
    email: ({ names, date, url, city }) => ({
      subject: `${names} — save the date, ${date}`,
      body: [
        'Hello,',
        '',
        `We are getting married on ${date}${city ? ` in ${city}` : ''}.`,
        '',
        'We made an invitation you can open on your phone: scroll through it, and reply to us straight from the page.',
        url,
        '',
        'We would love to have you with us.',
        '',
        names,
      ].join('\n'),
    }),
    whatsapp: ({ names, date, url }) => ({
      body: [
        `We are getting married on ${date}!`,
        '',
        `Here is our invitation: ${url}`,
        '',
        `Reply straight from the page. See you very soon — ${names}`,
      ].join('\n'),
    }),
  },
};

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `sms:` link with no recipient. The body separator differs between platforms
 * (`?body=` on Android, `&body=` after a recipient on iOS); with no recipient
 * `?body=` is the form both accept.
 */
export function smsHref(body: string): string {
  return `sms:?body=${encodeURIComponent(body)}`;
}

export function mailtoHref(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function whatsappHref(body: string): string {
  return `https://wa.me/?text=${encodeURIComponent(body)}`;
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/** One channel, rendered. */
export function shareMessage(
  channel: ShareChannel,
  locale: Locale,
  context: ShareContext,
): ShareMessage {
  const { subject, body } = TEMPLATES[locale][channel](context);

  const href =
    channel === 'sms'
      ? smsHref(body)
      : channel === 'whatsapp'
        ? whatsappHref(body)
        : mailtoHref(subject ?? '', body);

  return { channel, subject, body, href };
}

/** The three channels, in a stable order. */
export function shareMessages(locale: Locale, context: ShareContext): ShareMessage[] {
  return SHARE_CHANNELS.map((channel) => shareMessage(channel, locale, context));
}

/**
 * Builds the template context out of stored invitation content.
 *
 * `locale` is the language of the *message*, which the couple picks on the
 * share page: an English-speaking guest gets an English date even when the
 * invitation itself is in French.
 */
export function shareContext(
  content: InvitationContent,
  url: string,
  locale: Locale = content.locale,
): ShareContext {
  const date =
    locale === content.locale
      ? longDate(content)
      : longDate({ ...content, locale } as InvitationContent);

  return {
    names: `${content.couple.partner1.firstName} & ${content.couple.partner2.firstName}`,
    date,
    url,
    city: content.venue.city || undefined,
  };
}
