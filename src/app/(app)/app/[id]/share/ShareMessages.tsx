'use client';

import { useState } from 'react';
import { CopyButton } from './CopyButton';
import type { ShareMessage } from '@/lib/share-messages';
import type { Locale } from '@/i18n/config';

/**
 * Ready-to-send messages, one card per channel, with a language switch.
 *
 * Both language variants are rendered on the server and handed over as data:
 * switching is instant and works offline, and the couple can send an English
 * message about a French invitation to the half of the family that needs it.
 */
export function ShareMessages({
  messages,
  contentLocale,
  labels,
}: {
  messages: Record<Locale, ShareMessage[]>;
  /** Language of the invitation: the default selection. */
  contentLocale: Locale;
  labels: {
    language: string;
    localeNames: Record<Locale, string>;
    channels: Record<string, string>;
    subject: string;
    copy: string;
    copied: string;
    open: Record<string, string>;
  };
}) {
  const [locale, setLocale] = useState<Locale>(contentLocale);
  const list = messages[locale];

  return (
    <div className="space-y-4">
      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="sr-only">{labels.language}</legend>
        <span className="text-sm text-stone-600 dark:text-stone-400">{labels.language}</span>
        {(Object.keys(messages) as Locale[]).map((candidate) => (
          <label key={candidate} className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="share-message-locale"
              value={candidate}
              checked={locale === candidate}
              onChange={() => setLocale(candidate)}
            />
            {labels.localeNames[candidate]}
          </label>
        ))}
      </fieldset>

      <ul className="space-y-4">
        {list.map((message) => (
          <li
            key={message.channel}
            className="rounded-lg border border-stone-200 p-4 dark:border-stone-800"
          >
            <h3 className="text-sm font-semibold">{labels.channels[message.channel]}</h3>

            {message.subject && (
              <p className="mt-2 text-sm">
                <span className="text-stone-500">{labels.subject} : </span>
                {message.subject}
              </p>
            )}

            <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-stone-50 p-3 text-sm whitespace-pre-wrap dark:bg-stone-900">
              {message.body}
            </pre>

            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton
                value={message.subject ? `${message.subject}\n\n${message.body}` : message.body}
                label={labels.copy}
                copiedLabel={labels.copied}
              />
              <a
                href={message.href}
                target={message.channel === 'whatsapp' ? '_blank' : undefined}
                rel={message.channel === 'whatsapp' ? 'noopener noreferrer' : undefined}
                className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                {labels.open[message.channel]}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
