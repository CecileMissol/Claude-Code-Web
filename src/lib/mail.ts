import { getEnv } from './env';

/**
 * Mail abstraction.
 *
 * `MAIL_DRIVER=console` (development) prints the message; `MAIL_DRIVER=resend`
 * (production) posts it to the Resend API. Nothing else in the application
 * knows which one is in use.
 */

export interface MailMessage {
  to: string;
  subject: string;
  /** Plain-text body; always provided, used as the fallback part. */
  text: string;
  /** Optional HTML body. */
  html?: string;
  /** Overrides `MAIL_FROM`. */
  from?: string;
  replyTo?: string;
}

export interface MailResult {
  id: string | null;
  driver: 'console' | 'resend';
}

export interface Mailer {
  send(message: MailMessage): Promise<MailResult>;
}

/** Development driver: writes the message to the console, sends nothing. */
export const consoleMailer: Mailer = {
  async send(message) {
    console.info(
      [
        '',
        '──────── MAIL (console driver) ────────',
        `To:      ${message.to}`,
        `Subject: ${message.subject}`,
        '',
        message.text,
        '───────────────────────────────────────',
        '',
      ].join('\n'),
    );
    return { id: null, driver: 'console' };
  },
};

/** Production driver: Resend HTTP API (no SDK, so it runs on Workers). */
export function createResendMailer(apiKey: string, defaultFrom: string): Mailer {
  return {
    async send(message) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: message.from ?? defaultFrom,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          ...(message.html ? { html: message.html } : {}),
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend refused the message (${response.status}): ${body}`);
      }

      const payload = (await response.json()) as { id?: string };
      return { id: payload.id ?? null, driver: 'resend' };
    },
  };
}

/** Returns the mailer configured by the environment. */
export function getMailer(): Mailer {
  const env = getEnv();

  if (env.MAIL_DRIVER === 'resend') {
    if (!env.RESEND_API_KEY) throw new Error('MAIL_DRIVER=resend requires RESEND_API_KEY.');
    return createResendMailer(env.RESEND_API_KEY, env.MAIL_FROM);
  }

  return consoleMailer;
}

/** Convenience wrapper around `getMailer().send()`. */
export function sendMail(message: MailMessage): Promise<MailResult> {
  return getMailer().send(message);
}
