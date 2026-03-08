/**
 * Unified Authentication Hook
 *
 * Single hook for all auth operations: session verification, login, register,
 * logout, password update. Uses React Query for /me verification.
 *
 * Server is authoritative - cookies (HttpOnly) are verified via /api/auth/me.
 * No localStorage for auth state.
 *
 * @module hooks/useAuth
 */

"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAuthStore,
  useUser,
  useAuthPhase,
  useUserRole,
  useAdminRole,
} from "@/store/auth";
import type { EffectiveRole } from "@/lib/auth/types";
import { ROUTES, getPostLoginRedirect } from "@/lib/auth/route-rules";
import api, { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import toast from "react-hot-toast";
import type { User } from "@/types";
import { clearAuthCookies } from "@/lib/google-auth";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const AUTH_STALE_TIME = 0;
const AUTH_RETRY_COUNT = 0;
const AUTH_BROADCAST_CHANNEL = "auth";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

// Note: We removed the hasSessionCookie() check because the Rails backend
// sets HttpOnly cookies that can't be detected via document.cookie.
// Instead, we always verify with the server via /api/auth/me.

/**
 * Compute effective role from user data.
 */
function computeEffectiveRole(user: User | null): EffectiveRole | null {
  if (!user) return null;
  if (user.role === "admin" && user.admin_role) {
    return user.admin_role;
  }
  return user.role;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface UseAuthReturn {
  user: User | null;
  role: EffectiveRole | null;
  adminRole: User["admin_role"];
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthReady: boolean;

  login: (credentials: { email: string; password: string }) => void;
  loginAsync: (credentials: { email: string; password: string }) => Promise<{ user: User }>;
  isLoggingIn: boolean;

  register: (data: {
    first_name?: string;
    last_name?: string;
    name?: string;
    email: string;
    password: string;
    role?: string;
  }) => void;
  registerAsync: (data: {
    first_name?: string;
    last_name?: string;
    name?: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<{ user: User }>;
  isRegistering: boolean;

  logout: () => void;
  isLoggingOut: boolean;

  updatePassword: (
    data: { currentPassword: string; newPassword: string },
    options?: {
      onSuccess?: () => void;
      onError?: (error: ApiError) => void;
      onSettled?: () => void;
    }
  ) => void;
  isUpdatingPassword: boolean;

  refetchUser: () => Promise<unknown>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

/** Get returnTo from current URL (client-side only). Avoids useSearchParams for static generation. */
function getReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("returnTo");
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const t = useTranslations("auth");

  const user = useUser();
  const phase = useAuthPhase();
  const role = useUserRole();
  const adminRole = useAdminRole();

  const {
    authenticate,
    logout: clearAuth,
    startChecking,
    finishChecking,
  } = useAuthStore();

  const isAuthReady = phase === "ready";
  const isAuthenticated = isAuthReady && user !== null;

  /* ─────────────────────────────────────────────────────────────────────────
     SESSION VERIFICATION (React Query)
     ───────────────────────────────────────────────────────────────────────── */

  // Track if we should run verification
  const shouldVerify = phase === "initializing" || phase === "checking";

  const {
    refetch: refetchUser,
    isFetching: isVerifying,
    data: queryUser,
    isSuccess: querySuccess,
    isError: queryError,
    fetchStatus,
  } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async (): Promise<User | null> => {
      // Always try to verify with server - HttpOnly cookies can't be detected client-side
      try {
        const { user: verifiedUser } = await api.getMe();
        return verifiedUser ?? null;
      } catch {
        // Any error (401, network, etc.) means no valid session
        return null;
      }
    },
    enabled: shouldVerify,
    staleTime: 0, // Always consider stale
    retry: AUTH_RETRY_COUNT,
    refetchOnWindowFocus: false, // Disable to avoid flashing
    gcTime: 0, // Don't cache auth state
    networkMode: "always", // Always fetch from network
  });

  /* ─────────────────────────────────────────────────────────────────────────
     INITIALIZATION EFFECT
     ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (phase === "initializing") {
      // Always transition to checking - we can't detect HttpOnly cookies client-side
      // The query will call /api/auth/me to verify the session
      startChecking();
    }
  }, [phase, startChecking]);

  // Sync query result to store when query completes
  useEffect(() => {
    // fetchStatus 'idle' means the query is not actively fetching
    // Combined with querySuccess means we have a completed result
    if (phase === "checking" && fetchStatus === "idle" && querySuccess) {
      finishChecking(queryUser ?? null);
    }
  }, [phase, fetchStatus, querySuccess, queryUser, finishChecking]);

  /* ─────────────────────────────────────────────────────────────────────────
     CROSS-TAB SYNC (BroadcastChannel)
     ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    broadcastChannelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data === "logout") {
        clearAuth();
        queryClient.clear();
        router.push(ROUTES.LOGIN);
      } else if (event.data === "login") {
        // Refetch user on login from another tab
        refetchUser();
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [clearAuth, queryClient, router, refetchUser]);

  /* ─────────────────────────────────────────────────────────────────────────
     BROADCAST HELPERS
     ───────────────────────────────────────────────────────────────────────── */

  const broadcastLogout = useCallback(() => {
    broadcastChannelRef.current?.postMessage("logout");
  }, []);

  const broadcastLogin = useCallback(() => {
    broadcastChannelRef.current?.postMessage("login");
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
     LOGIN MUTATION
     ───────────────────────────────────────────────────────────────────────── */

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return api.login(email, password);
    },
    onSuccess: (data) => {
      authenticate(data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      broadcastLogin();
      toast.success(t("welcomeBack"));

      // Use returnTo from URL if present and valid, otherwise use role-based redirect
      const returnTo = getReturnTo();
      const redirectPath = returnTo ?? getPostLoginRedirect(computeEffectiveRole(data.user));
      router.push(redirectPath);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || t("invalidCredentials"));
    },
  });

  /* ─────────────────────────────────────────────────────────────────────────
     REGISTER MUTATION
     ───────────────────────────────────────────────────────────────────────── */

  const registerMutation = useMutation({
    mutationFn: async (data: {
      first_name?: string;
      last_name?: string;
      name?: string;
      email: string;
      password: string;
      role?: string;
    }) => api.register(data),
    onSuccess: (data) => {
      authenticate(data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      broadcastLogin();
      toast.success(t("accountCreated"));

      // Use returnTo from URL if present and valid, otherwise use role-based redirect
      const returnTo = getReturnTo();
      const redirectPath = returnTo ?? getPostLoginRedirect(computeEffectiveRole(data.user));
      router.push(redirectPath);
    },
    onError: (error: ApiError) => {
      toast.error(error.errors?.[0] || error.message || t("registrationFailed"));
    },
  });

  /* ─────────────────────────────────────────────────────────────────────────
     LOGOUT MUTATION
     ───────────────────────────────────────────────────────────────────────── */

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      clearAuth();
      clearAuthCookies();
      queryClient.clear();
      broadcastLogout();
      toast.success(t("loggedOut"));
      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      // Even on error, clear local state and redirect
      clearAuth();
      clearAuthCookies();
      queryClient.clear();
      broadcastLogout();
      router.push(ROUTES.LOGIN);
    },
  });

  /* ─────────────────────────────────────────────────────────────────────────
     UPDATE PASSWORD MUTATION
     ───────────────────────────────────────────────────────────────────────── */

  const updatePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => api.updatePassword(currentPassword, newPassword),
    onSuccess: () => toast.success(t("passwordUpdated")),
    onError: (error: ApiError) =>
      toast.error(error.message || t("updatePasswordFailed")),
  });

  /* ─────────────────────────────────────────────────────────────────────────
     RETURN
     ───────────────────────────────────────────────────────────────────────── */

  return {
    user,
    role,
    adminRole: adminRole ?? undefined,
    isAuthenticated,
    isLoading: phase === "initializing" || phase === "checking" || isVerifying,
    isAuthReady,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    updatePassword: updatePasswordMutation.mutate as UseAuthReturn["updatePassword"],
    isUpdatingPassword: updatePasswordMutation.isPending,

    refetchUser: () => refetchUser(),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADDITIONAL HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Lightweight hook for reading auth state without mutations.
 */
export function useAuthState() {
  const user = useUser();
  const phase = useAuthPhase();
  const role = useUserRole();
  const isReady = phase === "ready";

  return {
    user,
    role,
    phase,
    isAuthenticated: isReady && user !== null,
    isLoading: phase !== "ready",
    isReady,
  };
}

/**
 * Check if auth is ready (done loading).
 */
export function useAuthReady(): boolean {
  return useAuthStore((s) => s.phase === "ready");
}
