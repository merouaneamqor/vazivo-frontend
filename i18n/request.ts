import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const LOCALE_COOKIE = "locale";
const DEFAULT_LOCALE = "fr";
const SUPPORTED_LOCALES = ["en", "fr", "ar"] as const;

function normalizeLocale(value: string): string {
  const base = value.split("-")[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(base as (typeof SUPPORTED_LOCALES)[number])
    ? base
    : DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  let locale = DEFAULT_LOCALE;
  try {
    const store = await cookies();
    const cookieLocale = store.get(LOCALE_COOKIE)?.value;
    locale = cookieLocale ? normalizeLocale(cookieLocale) : DEFAULT_LOCALE;
  } catch {
    // During static generation / prerender there may be no request context
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: "UTC",
  };
});
