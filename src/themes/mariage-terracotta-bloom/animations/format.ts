/**
 * Locale-aware formatting of the small values the theme prints.
 *
 * `content` stores times as `HH:MM`, which is a storage format, not a reading
 * format: the validated mock-up writes "14h30", the way a French invitation
 * does. English-speaking guests expect "2:30 pm".
 */

/** `"14:30"` → `"14h30"` (fr) / `"2:30 pm"` (en). */
export function formatTime(time: string, locale: string): string {
  const [hours, minutes] = time.split(':');
  if (hours === undefined || minutes === undefined) return time;

  if (locale === 'fr') {
    // The mock-up's form: no leading zero on the hour, minutes always on two
    // digits, "14h" when the clock is on the hour.
    const hour = String(Number(hours));
    return minutes === '00' ? `${hour}h` : `${hour}h${minutes}`;
  }

  try {
    // `timeZone: 'UTC'` matters: the wall-clock time is built in UTC above, and
    // without it the visitor's own offset would shift what is printed.
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    })
      .format(new Date(Date.UTC(2000, 0, 1, Number(hours), Number(minutes))))
      .replace(/ | /g, ' ')
      .toLowerCase();
  } catch {
    return time;
  }
}
