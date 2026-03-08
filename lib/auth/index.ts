/**
 * Auth module public API (Client-Safe).
 *
 * This module only exports code that can be used in both client and server components.
 * For server-only functions (session management, DAL, authorize), import directly:
 *
 * - import { verifySession, requireAdmin } from "@/lib/auth/dal"
 * - import { createSession, getSession } from "@/lib/auth/session"
 * - import { authorize, authorizeRole } from "@/lib/auth/authorize"
 *
 * @module lib/auth
 */

// Types (client-safe)
export type {
  PrimaryRole,
  AdminRole,
  EffectiveRole,
  SessionPayload,
} from "./types";

// Cookie configuration (client-safe - just constants)
export {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "./cookies";

// Roles (client-safe)
export {
  PRIMARY_ROLES,
  ADMIN_SUB_ROLES,
  EFFECTIVE_ROLES,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  isPrimaryRole,
  isAdminSubRole,
  isEffectiveRole,
  isAdminRole,
  isProviderRole,
  isCustomerRole,
  isProviderOrAdmin,
  isStaffRole,
  getRoleLevel,
  hasMinimumRoleLevel,
  hasRoleAccess,
  getRoleLabel,
  normalizeRole,
  // Backward compatibility
  SYSTEM_ROLES,
  type SystemRole,
  isValidRole,
  isProviderOrAdminRole,
  isAllowedAdminRole,
  ALLOWED_ADMIN_ROLES,
} from "./roles";

// Permissions (client-safe)
export {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  type Permission,
} from "./permissions";

// Route rules (client-safe)
export {
  ROUTES,
  ROUTE_RULES,
  findRouteRule,
  buildRedirectUrl,
  authorizeRoute,
  getPostLoginRedirect,
  type ProtectionLevel,
  type RouteRule,
  type AuthDecision,
} from "./route-rules";
