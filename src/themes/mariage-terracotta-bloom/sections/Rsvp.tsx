'use client';

import { useId, useState } from 'react';
import type { InvitationContent } from '@/content/schema';
import { submitRsvp } from '@/lib/rsvp-client';
import type { InvitationMode } from '../../types';
import { isRsvpOpen } from '../animations/time';
import type { Messages } from '../messages';
import { buildSubmission, errorMessage, isHoneypotFilled, shouldCallApi } from './rsvp-logic';

/**
 * The RSVP card: a sheet of sand paper with an arched head.
 *
 * Only the published invitation talks to the API: in `preview` (editor) and
 * `demo` (Etsy showcase) the submission is faked, so nobody fills the couple's
 * dashboard with test replies. The sage wax seal drops onto the card once the
 * reply is in.
 */
export function Rsvp({
  t,
  content,
  mode,
  slug,
  initials,
}: {
  t: Messages;
  content: InvitationContent;
  mode: InvitationMode;
  slug?: string;
  initials: string;
}) {
  const ids = useId();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = isRsvpOpen(content);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || sent) return;

    const form = new FormData(event.currentTarget);
    setError(null);
    setPending(true);

    const payload = buildSubmission(form, slug ?? '');

    // A filled honeypot is a bot: pretend it worked, store nothing.
    if (isHoneypotFilled(payload)) {
      setPending(false);
      setSent(true);
      return;
    }

    if (!shouldCallApi(mode, slug)) {
      // Editor preview and public demo: play the success path, send nothing.
      window.setTimeout(() => {
        setPending(false);
        setSent(true);
      }, 400);
      return;
    }

    const result = await submitRsvp(payload);
    setPending(false);

    if (result.ok) {
      setSent(true);
      return;
    }
    setError(errorMessage(result.error, t));
  }

  return (
    <section className="tb-plain" id="rsvp" aria-label={t.rsvp.title}>
      <h2>{t.rsvp.title}</h2>

      <div className={`tb-rsvp${sent ? ' tb-sent' : ''}`}>
        {open ? (
          <form onSubmit={handleSubmit} noValidate={false}>
            <label>
              {t.rsvp.name}
              <input name="name" required autoComplete="name" maxLength={80} />
            </label>

            {content.rsvp.askEmail && (
              <label>
                {t.rsvp.email}
                <input name="email" type="email" required autoComplete="email" maxLength={120} />
              </label>
            )}

            <fieldset>
              <legend>{t.rsvp.attendingLegend}</legend>
              <div className="tb-choice">
                <label>
                  <input type="radio" name="attending" value="yes" required />
                  <span>{t.rsvp.yes}</span>
                </label>
                <label>
                  <input type="radio" name="attending" value="no" />
                  <span>{t.rsvp.no}</span>
                </label>
              </div>
            </fieldset>

            <label>
              {t.rsvp.guests}
              <select name="guests" defaultValue="1">
                {Array.from({ length: content.rsvp.maxGuestsPerReply }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ),
                )}
              </select>
            </label>

            {content.rsvp.askDiet && (
              <label>
                {t.rsvp.diet}
                <input name="diet" maxLength={200} />
              </label>
            )}

            {content.rsvp.askMessage && (
              <label>
                {t.rsvp.message}
                <textarea name="message" maxLength={600} />
              </label>
            )}

            {/* Honeypot. Never shown, never announced, never focusable. */}
            <div className="tb-trap" aria-hidden="true">
              <label htmlFor={`${ids}-website`}>{t.rsvp.honeypot}</label>
              <input
                id={`${ids}-website`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            {error && (
              <p className="tb-error" role="alert">
                {error}
              </p>
            )}

            <button className="tb-btn" type="submit" disabled={pending}>
              {pending ? t.rsvp.sending : t.rsvp.submit}
            </button>
          </form>
        ) : (
          <p className="tb-closed">{t.rsvp.closed}</p>
        )}

        <div className="tb-done-seal" aria-hidden="true">
          {initials}
        </div>
        <p className="tb-thanks" role="status">
          {sent ? t.rsvp.thanks : ''}
        </p>
      </div>

      <p className="tb-notice">{t.rsvp.dataNotice}</p>
    </section>
  );
}

export default Rsvp;
