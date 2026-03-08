/**
 * Role System for Authentication & Authorization
 *
 * Re-exports from lib/auth/roles.ts for backward compatibility.
 * New code should import from "@/lib/auth" or "@/lib/auth/roles".
 *
 * @module lib/roles
 * @deprecated Import from "@/lib/auth" instead
 */

import type { User } from "@/types";
import type { EffectiveRole } from "./auth/types";

// Re-export everything from the new location
export {
  // Constants
  PRIMARY_ROLES,
  ADMIN_SUB_ROLES,
  EFFECTIVE_ROLES,
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ALLOWED_ADMIN_ROLES,
  // Backward compat aliases
  SYSTEM_ROLES,
  type SystemRole,
  // Validation
  isPrimaryRole,
  isAdminSubRole,
  isEffectiveRole,
  isValidRole,
  normalizeRole,
  // Predicates
  isAdminRole,
  isProviderRole,
  isCustomerRole,
  isProviderOrAdmin,
  isProviderOrAdminRole,
  isStaffRole,
  isAllowedAdminRole,
  // Hierarchy
  getRoleLevel,
  hasMinimumRoleLevel,
  hasRoleAccess,
  // Display
  getRoleLabel,
} from "./auth/roles";

/**
 * Derive a SystemRole from a User model.
 * Kept here for backward compatibility with existing code.
 */
export function roleFromUser(user: Pick<User, "role"> | null | undefined): EffectiveRole | null {
  if (!user) return null;
  const role = user.role?.toLowerCase().trim();
  if (!role) return null;
  return role as EffectiveRole;
}
