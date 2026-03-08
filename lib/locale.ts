/**
 * Client-side locale cookie. Used to persist user preference and sync with backend user.locale.
 * Server reads this in i18n/request.ts via cookies().
 */
const LOCALE_COOKIE = "locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function setLocaleCookie(locale: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const SUPPORTED_LOCALES = ["en", "fr", "ar"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(value: string): SupportedLocale {
  const base = value.split("-")[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(base as SupportedLocale) ? (base as SupportedLocale) : "fr";
}
