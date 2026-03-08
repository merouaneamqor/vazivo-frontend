/**
 * Feature Flags — Public Barrel Export
 *
 * Re-exports the public surface area of the flag system.
 *
 * Import from this barrel whenever you need flags in shared/features code.
 * For server-only utilities, prefer importing directly from ./server.ts
 * to retain the "server-only" guard.
 *
 * @module src/shared/flags
 */

// Type contracts
export type { FlagKey, FlagValue, FlagValuesMap, FlagMeta, FlagContext } from "./types";

// Flag declarations (safe to import anywhere; evaluation is lazy)
export {
  featureFlags,
  FLAG_METADATA,
  // Booking
  newBookingFlowFlag,
  quickRebookFlag,
  // Search
  smartFiltersFlag,
  mapViewFlag,
  // Business
  socialShareFlag,
  storyHighlightsFlag,
  // Analytics
  analyticsV2Flag,
  providerAnalyticsV2Flag,
  // Onboarding
  onboardingWizardFlag,
} from "./flags";

// Edge Config singleton (for custom flag providers or direct reads)
export { edgeConfig } from "./edge-config";
