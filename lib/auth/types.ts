/**
 * Authentication type definitions.
 * Canonical types for session payload and role model.
 *
 * @module lib/auth/types
 */

/** Primary user role stored in database (users.role) */
export type PrimaryRole = "customer" | "provider" | "admin";

/** Admin sub-role (users.admin_role), only when role === "admin" */
export type AdminRole =
  | "superadmin"
  | "support"
  | "moderator"
  | "finance"
  | "technical_admin";

/** Effective role for routing: primary role or admin sub-role when admin */
export type EffectiveRole = PrimaryRole | AdminRole;

/**
 * Session payload stored in encrypted JWT cookie.
 * Minimal claims for routing and server-side authorization.
 */
export interface SessionPayload {
  userId: number;
  role: PrimaryRole;
  adminRole: AdminRole | null;
  effectiveRole: EffectiveRole;
  exp: number;
  iat: number;
}
