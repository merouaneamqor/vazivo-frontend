/**
 * Auth module server-only API.
 *
 * This module re-exports all server-only auth functions for convenience.
 * Import from this file in Server Components, Server Actions, and Route Handlers.
 *
 * @example
 * // In a Server Component or Server Action:
 * import { verifySession, requireAdmin, authorize } from "@/lib/auth/server";
 *
 * @module lib/auth/server
 */

import "server-only";

// Re-export everything from the client-safe index
export * from "./index";

// Session management (server-only)
export {
  encrypt,
  decrypt,
  computeEffectiveRole,
  createSession,
  getSession,
  updateSession,
  deleteSession,
  isSessionExpired,
} from "./session";

// Data Access Layer (server-only)
export {
  verifySession,
  getOptionalSession,
  requireAdmin,
  requireProvider,
  requireCustomer,
  requireAdminRoles,
  canAccessAdmin,
  canAccessProvider,
  isAuthenticated,
  isValidAdminRole,
  type VerifiedSession,
} from "./dal";

// Server Action authorization (server-only)
export {
  authorize,
  authorizeAll,
  authorizeAny,
  authorizeRole,
  authorizeRoles,
  authorizeOwnerOrAdmin,
  canAccess,
  canAccessOwnerOrAdmin,
  getCurrentUserId,
  getCurrentRole,
  UnauthorizedError,
  ForbiddenError,
} from "./authorize";
