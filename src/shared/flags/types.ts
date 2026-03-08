/**
 * Feature Flag Type Definitions
 *
 * Central type contracts for the flag system.
 * Keeps flag keys strongly-typed across server and client code.
 *
 * @module src/shared/flags/types
 */

/* ═══════════════════════════════════════════════════════════════════════════
   FLAG KEY REGISTRY
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * All valid feature flag keys.
 * Add a new entry here whenever a new flag is declared in flags.ts.
 * This is the single source of truth for key autocomplete and type safety.
 */
export type FlagKey =
  // ── Booking feature flags ────────────────────────────────────────────────
  | "new-booking-flow"
  | "quick-rebook"
  // ── Search feature flags ─────────────────────────────────────────────────
  | "smart-filters"
  | "map-view"
  // ── Business / social flags ──────────────────────────────────────────────
  | "social-share"
  | "story-highlights"
  // ── Provider portal flags ─────────────────────────────────────────────────
  | "analytics-v2"
  | "provider-analytics-v2"
  // ── Onboarding flags ─────────────────────────────────────────────────────
  | "onboarding-wizard";

/* ═══════════════════════════════════════════════════════════════════════════
   FLAG VALUE TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/** A flag value is a boolean (on/off) or a string variant (A/B/C). */
export type FlagValue = boolean | string;

/**
 * Map of all flag keys to their resolved values.
 * Used when batch-resolving flags for precomputed static pages.
 */
export type FlagValuesMap = Record<FlagKey, FlagValue>;

/* ═══════════════════════════════════════════════════════════════════════════
   FLAG CONTEXT
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Context available during flag evaluation in the `decide` function.
 * Populated from the incoming request in middleware.
 */
export interface FlagContext {
  /** User ID from JWT session (null if unauthenticated). */
  userId?: number | null;
  /** Primary role from JWT session. */
  role?: "customer" | "provider" | "admin" | null;
  /** Admin sub-role, only present when role === "admin". */
  adminRole?: string | null;
  /** Raw request headers for accessing custom signals. */
  headers?: Headers;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLAG METADATA
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Static metadata about a flag declaration.
 * Used by the toolbar and the /api/flags introspection endpoint.
 */
export interface FlagMeta {
  key: FlagKey;
  description: string;
  defaultValue: FlagValue;
  feature: string;
}
