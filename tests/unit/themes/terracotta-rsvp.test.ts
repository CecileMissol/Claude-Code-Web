import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { InvitationContent, type RsvpSettings } from '@/content/schema';
import { RsvpSubmission } from '@/content/rsvp';
import demo from '@/themes/mariage-terracotta-bloom/demo.json';
import Invitation from '@/themes/mariage-terracotta-bloom/Invitation';
import en from '@/themes/mariage-terracotta-bloom/messages/en.json';
import type { Messages } from '@/themes/mariage-terracotta-bloom/messages';
import {
  buildSubmission,
  clampGuests,
  errorMessage,
  isHoneypotFilled,
  shouldCallApi,
} from '@/themes/mariage-terracotta-bloom/sections/rsvp-logic';
import type { InvitationMode } from '@/themes/types';

/**
 * The RSVP card: what the form offers is driven entirely by `content.rsvp`, and
 * only a published invitation is allowed to write a reply.
 */

const content = InvitationContent.parse(demo);
const t = en as Messages;
const SLUG = 'willa-and-beau';

function renderRsvp(rsvp: Partial<RsvpSettings> = {}, mode: InvitationMode = 'demo'): string {
  return renderToStaticMarkup(
    createElement(Invitation, {
      content: { ...content, rsvp: { ...content.rsvp, ...rsvp } },
      mode,
      slug: mode === 'public' ? SLUG : undefined,
    }),
  );
}

describe('shouldCallApi', () => {
  it('only lets a published invitation write a reply', () => {
    expect(shouldCallApi('public', SLUG)).toBe(true);
  });

  it('never writes from the editor preview or the public demo', () => {
    expect(shouldCallApi('preview', SLUG)).toBe(false);
    expect(shouldCallApi('demo', SLUG)).toBe(false);
  });

  it('never writes without a slug to answer for', () => {
    expect(shouldCallApi('public', undefined)).toBe(false);
    expect(shouldCallApi('public', '')).toBe(false);
  });
});

describe('buildSubmission', () => {
  function form(entries: Record<string, string>): FormData {
    const data = new FormData();
    for (const [key, value] of Object.entries(entries)) data.append(key, value);
    return data;
  }

  it('produces a payload the API schema accepts', () => {
    const payload = buildSubmission(
      form({
        name: '  Alice Mendez ',
        email: ' alice@example.com ',
        attending: 'yes',
        guests: '3',
        diet: ' no peanuts ',
        message: ' We would not miss it! ',
        website: '',
      }),
      SLUG,
    );

    expect(payload).toEqual({
      slug: SLUG,
      name: 'Alice Mendez',
      email: 'alice@example.com',
      attending: true,
      guests: 3,
      diet: 'no peanuts',
      message: 'We would not miss it!',
      website: '',
    });
    expect(RsvpSubmission.safeParse(payload).success).toBe(true);
  });

  it('reads "no" as a decline', () => {
    expect(buildSubmission(form({ name: 'A', attending: 'no' }), 's').attending).toBe(false);
    expect(buildSubmission(form({ name: 'A' }), 's').attending).toBe(false);
  });

  it('defaults to one guest when the field is missing', () => {
    expect(buildSubmission(form({ name: 'A' }), 's').guests).toBe(1);
  });

  it('does not trim the honeypot, so a lone space is still caught', () => {
    expect(buildSubmission(form({ name: 'A', website: ' ' }), 's').website).toBe(' ');
  });
});

describe('clampGuests', () => {
  it('keeps the value inside the range the API accepts', () => {
    expect(clampGuests(0)).toBe(1);
    expect(clampGuests(-4)).toBe(1);
    expect(clampGuests(3)).toBe(3);
    expect(clampGuests(99)).toBe(10);
    expect(clampGuests(Number.NaN)).toBe(1);
  });
});

describe('isHoneypotFilled', () => {
  it('lets a human through and catches a bot', () => {
    expect(isHoneypotFilled({ website: '' })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled({ website: 'http://spam.example' })).toBe(true);
  });
});

describe('errorMessage', () => {
  it('maps every API failure to a sentence in the invitation language', () => {
    expect(errorMessage('rate_limited', t)).toBe(t.rsvp.errors.rateLimited);
    expect(errorMessage('invalid', t)).toBe(t.rsvp.errors.invalid);
    expect(errorMessage('closed', t)).toBe(t.rsvp.closed);
    expect(errorMessage('server', t)).toBe(t.rsvp.errors.server);
    expect(errorMessage('not_found', t)).toBe(t.rsvp.errors.server);
  });
});

describe('the rendered form', () => {
  it('offers every field the couple asked for', () => {
    const html = renderRsvp();
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="attending"');
    expect(html).toContain('name="guests"');
    expect(html).toContain('name="diet"');
    expect(html).toContain('name="message"');
  });

  it('drops the optional fields the couple turned off', () => {
    const html = renderRsvp({ askEmail: false, askDiet: false, askMessage: false });
    expect(html).not.toContain('name="email"');
    expect(html).not.toContain('name="diet"');
    expect(html).not.toContain('name="message"');
    // The required ones stay.
    expect(html).toContain('name="name"');
    expect(html).toContain('name="attending"');
  });

  it('offers exactly as many guests as the couple allows', () => {
    const html = renderRsvp({ maxGuestsPerReply: 3 });
    expect(html).toContain('value="3"');
    expect(html).not.toContain('value="4"');
  });

  it('always carries the hidden honeypot, out of reach of keyboard and screen readers', () => {
    const html = renderRsvp();
    expect(html).toContain('name="website"');
    expect(html).toContain('class="tb-trap"');
    expect(html).toContain('tabindex="-1"');
  });

  it('shows the data-protection notice below the form, in the invitation language', () => {
    expect(renderRsvp()).toContain('deleted six months after the event');
    const french = renderToStaticMarkup(
      createElement(Invitation, { content: { ...content, locale: 'fr' as const }, mode: 'demo' }),
    );
    expect(french).toContain('supprimée six mois après');
  });

  it('replaces the form with a closing notice when RSVP is disabled', () => {
    const html = renderRsvp({ enabled: false });
    expect(html).not.toContain('name="attending"');
    expect(html).toContain('Replies are closed.');
  });

  it('replaces the form with a closing notice once the deadline has passed', () => {
    const html = renderRsvp({ deadline: '2020-01-01' });
    expect(html).not.toContain('name="attending"');
    expect(html).toContain('Replies are closed.');
  });

  it('keeps the form open while the deadline is still ahead', () => {
    const html = renderRsvp({ deadline: '2099-01-01' });
    expect(html).toContain('name="attending"');
  });

  it('carries the wax seal that lands on the card once the reply is in', () => {
    const html = renderRsvp();
    expect(html).toContain('class="tb-done-seal"');
    expect(html).toContain('class="tb-thanks"');
  });
});
