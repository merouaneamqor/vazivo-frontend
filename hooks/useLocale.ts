"use client";

import { useLocale as useNextIntlLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useUser } from "@/store/auth";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { setLocaleCookie, normalizeLocale, type SupportedLocale } from "@/lib/locale";

/**
 * Returns current locale and a function to change it.
 * Setting locale: updates cookie, optionally saves to user profile, then refreshes the app.
 */
export function useLocale() {
  const locale = useNextIntlLocale() as SupportedLocale;
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useUser();

  const setUser = useAuthStore((s) => s.setUser);

  const updateProfileMutation = useMutation({
    mutationFn: (newLocale: string) => api.updateProfile({ locale: newLocale }),
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(queryKeys.auth.me, data.user);
        setUser(data.user);
      }
    },
  });

  const setLocale = useCallback(
    async (newLocale: string) => {
      const normalized = normalizeLocale(newLocale);
      setLocaleCookie(normalized);
      if (user) {
        await updateProfileMutation.mutateAsync(normalized);
      }
      router.refresh();
    },
    [user, router, updateProfileMutation, setUser]
  );

  return { locale, setLocale, isUpdating: updateProfileMutation.isPending };
}
