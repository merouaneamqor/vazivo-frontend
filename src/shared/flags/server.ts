/**
 * Server-Side Feature Flag Utilities
 *
 * Provides typed helpers for reading flags inside:
 *  - React Server Components (RSC)
 *  - Server Actions
 *  - Route Handlers (API routes)
 *
 * Imports "server-only" to prevent accidental inclusion in client bundles.
 * Flags are evaluated once per request; values flow downward as props.
 *
 * @module src/shared/flags/server
 */

import "server-only";
import { featureFlags, FLAG_METADATA } from "./flags";
import type { FlagKey, FlagValuesMap, FlagMeta } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   BATCH RESOLUTION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Resolve every registered flag in parallel.
 * Use this in layout.tsx or page.tsx when you need multiple flag values,
 * or when generating static params for ISR page variants.
 *
 * @example
 * const flags = await getAllFlagValues();
 * const showNewFlow = flags["new-booking-flow"];
 */
export async function getAllFlagValues(): Promise<FlagValuesMap> {
  const values = await Promise.all(featureFlags.map((f) => f()));

  return Object.fromEntries(
    featureFlags.map((f, i) => [f.key, values[i]])
  ) as FlagValuesMap;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SINGLE FLAG READ
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Resolve a single flag by its key.
 * Preferred over `getAllFlagValues()` when only one flag is needed.
 *
 * @example
 * const showSmartFilters = await getFlagValue("smart-filters");
 */
export async function getFlagValue(key: FlagKey): Promise<boolean> {
  const flagFn = featureFlags.find((f) => f.key === key);
  if (!flagFn) return false;
  const value = await flagFn();
  return Boolean(value);
}

/* ═══════════════════════════════════════════════════════════════════════════
   MULTI FLAG READ (typed tuple)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Resolve an explicit set of flag keys in parallel.
 * Returns a plain object with the requested keys.
 *
 * @example
 * const { "new-booking-flow": newFlow, "social-share": socialShare } =
 *   await getFlags(["new-booking-flow", "social-share"]);
 */
export async function getFlags(
  keys: readonly FlagKey[]
): Promise<Partial<FlagValuesMap>> {
  const relevant = featureFlags.filter((f) =>
    keys.includes(f.key as FlagKey)
  );

  const values = await Promise.all(relevant.map((f) => f()));

  return Object.fromEntries(
    relevant.map((f, i) => [f.key, values[i]])
  ) as Partial<FlagValuesMap>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   METADATA (for toolbar/introspection endpoint)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Returns static metadata for all registered flags.
 * Used by the /api/flags route handler to power Vercel Toolbar discovery.
 */
export function getAllFlagMeta(): FlagMeta[] {
  return FLAG_METADATA;
}
