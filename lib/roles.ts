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
  
  
  
  
  
  
  // Backward compat aliases
  SYSTEM_ROLES,
  type SystemRole,
  // Validation
  
  
  
  
  
  // Predicates
  isAdminRole,
  
  
  
  isProviderOrAdminRole,
  
  isAllowedAdminRole,
  // Hierarchy
  
  
  
  // Display
  
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
