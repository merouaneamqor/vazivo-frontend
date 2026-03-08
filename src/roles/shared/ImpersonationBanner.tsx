/**
 * Impersonation Banner — Shared Role Component
 *
 * Re-exports the existing ImpersonationBanner from components/.
 * Lives in src/roles/shared/ because it applies across all portals
 * (admin, provider, customer) and is not feature-specific.
 *
 * @module src/roles/shared/ImpersonationBanner
 */

export { ImpersonationBanner } from "@/components/ImpersonationBanner";
