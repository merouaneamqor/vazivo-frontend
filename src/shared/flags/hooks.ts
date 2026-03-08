/**
 * Client-Side Feature Flag Hooks
 *
 * Thin wrappers around @vercel/flags/client hooks.
 * Flag values are pre-resolved at the edge by middleware and injected
 * via the x-flags-precomputed header — client hooks only *read* those
 * values, they never re-evaluate the decide() function in the browser.
 *
 * All hooks are "use client" compatible. Import them only from Client
 * Components. Server Components should use src/shared/flags/server.ts.
 *
 * @module src/shared/flags/hooks
 */

"use client";

import type { FlagKey } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMARY HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Read a single boolean feature flag in a Client Component.
 *
 * The value comes from the precomputed cookie set by middleware — there
 * is no network round-trip or flicker.
 *
 * @param key    - A registered FlagKey.
 * @param defaultValue - Fallback while the precomputed value is being read.
 *
 * @example
 * const smartFiltersEnabled = useFeatureFlag("smart-filters");
 * return smartFiltersEnabled ? <SmartFilters /> : <SearchFilters />;
 */
export function useFeatureFlag(
  key: FlagKey,
  defaultValue: boolean = false
): boolean {
  // Read the precomputed flags cookie injected by middleware.
  // In a browser context this comes from document.cookie; in SSR from
  // the Next.js cookies() header bag.
  if (typeof document === "undefined") return defaultValue;

  try {
    const cookieName = `__flag_${key}`;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`));

    if (!match) return defaultValue;
    return match.split("=")[1] === "1";
  } catch {
    return defaultValue;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   VARIANT HOOK (string flags for A/B/C experiments)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Read a string-variant feature flag in a Client Component.
 * Returns the variant string or the defaultValue if not set.
 *
 * @example
 * const layout = useFlagVariant("search-layout", "grid");
 * return layout === "list" ? <ListView /> : <GridView />;
 */
export function useFlagVariant(
  key: FlagKey,
  defaultValue: string = ""
): string {
  if (typeof document === "undefined") return defaultValue;

  try {
    const cookieName = `__flag_${key}`;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`));

    if (!match) return defaultValue;
    return decodeURIComponent(match.split("=")[1]);
  } catch {
    return defaultValue;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONVENIENCE EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

export type { FlagKey };
