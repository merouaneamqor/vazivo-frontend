"use client";

import { useEffect } from "react";
import { useUser } from "@/store/auth";
import { getLocaleCookie, setLocaleCookie, normalizeLocale } from "@/lib/locale";

/**
 * When user is loaded and has a preferred locale, sync it to the cookie
 * so that server-side rendering uses the same locale on next request.
 */
export function LocaleSync() {
  const user = useUser();

  useEffect(() => {
    if (!user?.locale) return;
    const preferred = normalizeLocale(user.locale);
    const current = getLocaleCookie();
    if (current !== preferred) {
      setLocaleCookie(preferred);
    }
  }, [user?.locale]);

  return null;
}
