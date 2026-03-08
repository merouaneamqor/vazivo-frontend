/**
 * Unified Authentication Store
 *
 * Single source of truth for client-side auth state.
 * Server-authoritative: cookies are the source of truth.
 * No localStorage persistence - state comes from /api/auth/me.
 *
 * Phases: initializing → checking (verify /me) → ready
 *
 * @module store/auth
 */

import { create } from "zustand";
import type { User } from "@/types";
import type { EffectiveRole } from "@/lib/auth/types";

export type AuthPhase = "initializing" | "checking" | "ready";

interface AuthStoreState {
  user: User | null;
  phase: AuthPhase;
  /** Selected staff id for provider calendar filter (null = all) */
  selectedCalendarStaffId: number | null;

  // Actions
  setUser: (user: User | null) => void;
  setPhase: (phase: AuthPhase) => void;
  setSelectedCalendarStaffId: (id: number | null) => void;
  reset: () => void;
  authenticate: (user: User) => void;
  logout: () => void;
  startChecking: () => void;
  finishChecking: (user: User | null) => void;
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  user: null,
  phase: "initializing",
  selectedCalendarStaffId: null,

  setUser: (user) =>
    set({
      user,
      phase: "ready",
    }),

  setPhase: (phase) => set({ phase }),

  setSelectedCalendarStaffId: (id) =>
    set({ selectedCalendarStaffId: id }),

  reset: () =>
    set({
      user: null,
      phase: "ready",
      selectedCalendarStaffId: null,
    }),

  authenticate: (user) =>
    set({
      user,
      phase: "ready",
    }),

  logout: () =>
    set({
      user: null,
      phase: "ready",
      selectedCalendarStaffId: null,
    }),

  startChecking: () =>
    set({
      phase: "checking",
    }),

  finishChecking: (user) =>
    set({
      user,
      phase: "ready",
    }),
}));

/* ─────────────────────────────────────────────────────────────────────────
   DERIVED SELECTORS
   ───────────────────────────────────────────────────────────────────────── */

export const useUser = () => useAuthStore((s) => s.user);

export const useAuthPhase = () => useAuthStore((s) => s.phase);

export const useIsAuthenticated = () =>
  useAuthStore((s) => s.phase === "ready" && s.user !== null);

export const useAuthLoading = () =>
  useAuthStore((s) => s.phase === "initializing" || s.phase === "checking");

export const useAuthReady = () => useAuthStore((s) => s.phase === "ready");

export const useUserRole = (): EffectiveRole | null =>
  useAuthStore((s) => {
    if (!s.user) return null;
    // If admin with sub-role, use sub-role as effective role
    if (s.user.role === "admin" && s.user.admin_role) {
      return s.user.admin_role;
    }
    return s.user.role;
  });

export const useAdminRole = () =>
  useAuthStore((s) => s.user?.admin_role ?? null);

/** Get the raw primary role from the user */
export const usePrimaryRole = () =>
  useAuthStore((s) => s.user?.role ?? null);

/** Provider is confirmed (or user is admin - admins bypass). */
export const useProviderConfirmed = () =>
  useAuthStore((s) => {
    const user = s.user;
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role !== "provider") return false;
    return user.provider_status === "confirmed";
  });

/** Provider has active premium (any business) or user is admin - admins bypass. */
export const useProviderPremium = () =>
  useAuthStore((s) => {
    const user = s.user;
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role !== "provider") return false;
    return (user as { premium?: boolean }).premium === true;
  });

/** Premium expiry date (or null). Per-business expiry comes from provider subscription API. */
export const usePremiumExpiresAt = () =>
  useAuthStore((s) => (s.user as { premium_expires_at?: string | null } | undefined)?.premium_expires_at ?? null);

/** Selected staff id for provider calendar (null = all). */
export const useSelectedCalendarStaffId = () => useAuthStore((s) => s.selectedCalendarStaffId);

export const useSetSelectedCalendarStaffId = () => useAuthStore((s) => s.setSelectedCalendarStaffId);
