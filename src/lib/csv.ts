import type { Locale } from '@/i18n/config';

/**
 * CSV export.
 *
 * Two details matter more than the format itself, because the file is opened in
 * Excel by people who are not developers:
 *
 * - a **UTF-8 byte-order mark**, without which Excel on Windows mangles every
 *   accent;
 * - a **semicolon separator in French**, because Excel reads the list separator
 *   from the system locale and a French Excel splits on `;`, not on `,`.
 */

/** Byte-order mark, prepended so Excel detects UTF-8. */
export const BOM = '﻿';

/** List separator Excel expects for a locale. */
export function separatorFor(locale: Locale): ';' | ',' {
  return locale === 'fr' ? ';' : ',';
}

/**
 * Quotes one field (RFC 4180): always when it contains the separator, a quote,
 * a newline or a leading/trailing space, and doubles inner quotes.
 *
 * A leading `=`, `+`, `-` or `@` is also neutralised with a leading apostrophe:
 * a guest could otherwise type a formula into the message field and have it
 * evaluated when the couple opens the file.
 */
export function csvField(value: unknown, separator: string): string {
  if (value === null || value === undefined) return '';

  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  const mustQuote =
    text.includes(separator) ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r') ||
    text !== text.trim();

  return mustQuote ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Renders a header row plus data rows as a CSV document. */
export function toCsv(
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
  locale: Locale,
): string {
  const separator = separatorFor(locale);
  const lines = [headers, ...rows].map((row) =>
    row.map((cell) => csvField(cell, separator)).join(separator),
  );

  return BOM + lines.join('\r\n') + '\r\n';
}
