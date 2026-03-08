/**
 * Feature Flag Registry
 *
 * The single authoritative list of every feature flag in the platform.
 * Each flag is declared with the Vercel Flags SDK `flag()` factory, which
 * wires it to the Vercel Toolbar (Flags Explorer) and enables precompute().
 *
 * Design rules:
 *  - One entry per flag. No flag is declared elsewhere.
 *  - `decide()` reads from Edge Config; falls back to `defaultValue`.
 *  - Feature-specific files (e.g. src/features/booking/flags.ts) re-export
 *    their relevant flags from here — they do NOT declare new flags.
 *
 * @module src/shared/flags/flags
 * @see https://vercel.com/docs/workflow-collaboration/feature-flags
 */

import { flag } from "@vercel/flags/next";
import { edgeConfig } from "./edge-config";
import type { FlagMeta } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Read a boolean flag value from Edge Config.
 * Returns the fallback if the key is missing or Edge Config is unavailable.
 */
async function readBool(key: string, fallback: boolean): Promise<boolean> {
  try {
    const value = await edgeConfig.get<boolean>(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING FLAGS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Enables the redesigned multi-step booking flow (UnifiedBookingFlow).
 * When false, the legacy BookingModal / QuickBookModal are used.
 */
export const newBookingFlowFlag = flag<boolean>({
  key: "new-booking-flow",
  defaultValue: false,
  description: "Enables the redesigned multi-step booking flow",
  decide: () => readBool("new-booking-flow", false),
});

/**
 * Shows a Quick Rebook shortcut on the customer bookings list.
 */
export const quickRebookFlag = flag<boolean>({
  key: "quick-rebook",
  defaultValue: true,
  description: "Quick-rebook shortcut on customer bookings list",
  decide: () => readBool("quick-rebook", true),
});

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH FLAGS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Activates AI-powered SmartFilters on the search results page.
 * Falls back to standard SearchFilters when disabled.
 */
export const smartFiltersFlag = flag<boolean>({
  key: "smart-filters",
  defaultValue: false,
  description: "AI-powered search filter suggestions",
  decide: () => readBool("smart-filters", false),
});

/**
 * Shows the map view toggle on search results.
 */
export const mapViewFlag = flag<boolean>({
  key: "map-view",
  defaultValue: true,
  description: "Map view toggle on search results",
  decide: () => readBool("map-view", true),
});

/* ═══════════════════════════════════════════════════════════════════════════
   BUSINESS / SOCIAL FLAGS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Renders social sharing buttons on business profile pages.
 */
export const socialShareFlag = flag<boolean>({
  key: "social-share",
  defaultValue: false,
  description: "Social sharing buttons on business pages",
  decide: () => readBool("social-share", false),
});

/**
 * Renders story-style highlight reels on business profile pages.
 */
export const storyHighlightsFlag = flag<boolean>({
  key: "story-highlights",
  defaultValue: false,
  description: "Story highlight reels on business profiles",
  decide: () => readBool("story-highlights", false),
});

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS / PROVIDER FLAGS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Enables the new analytics dashboard for admin users.
 */
export const analyticsV2Flag = flag<boolean>({
  key: "analytics-v2",
  defaultValue: false,
  description: "New analytics dashboard for admin",
  decide: () => readBool("analytics-v2", false),
});

/**
 * Enables the new statistics view for provider portal.
 * Only evaluated when the requesting user is a provider.
 */
export const providerAnalyticsV2Flag = flag<boolean>({
  key: "provider-analytics-v2",
  defaultValue: false,
  description: "New statistics view for provider portal",
  decide: () => readBool("provider-analytics-v2", false),
});

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING FLAGS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Shows the guided OnboardingWizard for new provider registrations.
 */
export const onboardingWizardFlag = flag<boolean>({
  key: "onboarding-wizard",
  defaultValue: false,
  description: "Guided onboarding wizard for new provider registrations",
  decide: () => readBool("onboarding-wizard", false),
});

/* ═══════════════════════════════════════════════════════════════════════════
   REGISTRY ARRAY
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Complete list of all flags.
 * Used by:
 *  - middleware.ts  → precompute() for static page variant generation
 *  - /api/flags     → Toolbar discovery endpoint
 *  - generateStaticParams() → ISR permutation generation
 */
export const featureFlags = [
  newBookingFlowFlag,
  quickRebookFlag,
  smartFiltersFlag,
  mapViewFlag,
  socialShareFlag,
  storyHighlightsFlag,
  analyticsV2Flag,
  providerAnalyticsV2Flag,
  onboardingWizardFlag,
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   METADATA REGISTRY (for introspection endpoint)
   ═══════════════════════════════════════════════════════════════════════════ */

export const FLAG_METADATA: FlagMeta[] = [
  { key: "new-booking-flow",       defaultValue: false, feature: "booking",       description: "Enables the redesigned multi-step booking flow" },
  { key: "quick-rebook",           defaultValue: true,  feature: "booking",       description: "Quick-rebook shortcut on customer bookings list" },
  { key: "smart-filters",          defaultValue: false, feature: "search",        description: "AI-powered search filter suggestions" },
  { key: "map-view",               defaultValue: true,  feature: "search",        description: "Map view toggle on search results" },
  { key: "social-share",           defaultValue: false, feature: "business",      description: "Social sharing buttons on business pages" },
  { key: "story-highlights",       defaultValue: false, feature: "business",      description: "Story highlight reels on business profiles" },
  { key: "analytics-v2",           defaultValue: false, feature: "analytics",     description: "New analytics dashboard for admin" },
  { key: "provider-analytics-v2",  defaultValue: false, feature: "analytics",     description: "New statistics view for provider portal" },
  { key: "onboarding-wizard",      defaultValue: false, feature: "onboarding",    description: "Guided onboarding wizard for new providers" },
];
