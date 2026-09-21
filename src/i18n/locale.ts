'use server';

import { cookies, headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  matchAcceptLanguage,
  type Locale,
} from './config';

/**
 * Resolves the interface locale for the current request:
 * `locale` cookie → `Accept-Language` header → {@link DEFAULT_LOCALE}.
 */
export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return matchAcceptLanguage(headerStore.get('accept-language')) ?? DEFAULT_LOCALE;
}

/** Server action used by the language switcher to persist the chosen locale. */
export async function setUserLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    httpOnly: false,
  });
}
