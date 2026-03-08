/**
 * Role System for Authentication & Authorization
 *
 * Canonical role definitions with clear separation:
 * - PRIMARY_ROLES: Database roles (users.role)
 * - ADMIN_SUB_ROLES: Admin sub-roles (users.admin_role)
 * - EFFECTIVE_ROLES: Combined roles for routing/permissions
 *
 * @module lib/auth/roles
 */

import type { PrimaryRole, AdminRole, EffectiveRole } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Primary roles stored in database (users.role column).
 */
export const PRIMARY_ROLES = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
  ADMIN: "admin",
} as const;

/**
 * Admin sub-roles (users.admin_role column).
 * Only applicable when role === "admin".
 */
export const ADMIN_SUB_ROLES = {
  SUPERADMIN: "superadmin",
  SUPPORT: "support",
  MODERATOR: "moderator",
  FINANCE: "finance",
  TECHNICAL_ADMIN: "technical_admin",
} as const;

/**
 * All effective roles for routing and authorization.
 * Union of primary roles and admin sub-roles.
 */
export const EFFECTIVE_ROLES = {
  ...PRIMARY_ROLES,
  ...ADMIN_SUB_ROLES,
} as const;

/**
 * Role hierarchy for permission inheritance.
 * Higher index = more permissions.
 */
export const ROLE_HIERARCHY: readonly EffectiveRole[] = [
  "customer",
  "provider",
  "support",
  "moderator",
  "finance",
  "technical_admin",
  "admin",
  "superadmin",
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDATION SETS (O(1) lookup)
   ═══════════════════════════════════════════════════════════════════════════ */

const VALID_PRIMARY_ROLES = new Set<string>(Object.values(PRIMARY_ROLES));
const VALID_ADMIN_SUB_ROLES = new Set<string>(Object.values(ADMIN_SUB_ROLES));
const VALID_EFFECTIVE_ROLES = new Set<string>(Object.values(EFFECTIVE_ROLES));

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDATION FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if a string is a valid primary role.
 */
export function isPrimaryRole(role: string | null | undefined): role is PrimaryRole {
  return !!role && VALID_PRIMARY_ROLES.has(role.toLowerCase());
}

/**
 * Check if a string is a valid admin sub-role.
 */
export function isAdminSubRole(role: string | null | undefined): role is AdminRole {
  return !!role && VALID_ADMIN_SUB_ROLES.has(role.toLowerCase());
}

/**
 * Check if a string is a valid effective role.
 */
export function isEffectiveRole(role: string | null | undefined): role is EffectiveRole {
  return !!role && VALID_EFFECTIVE_ROLES.has(role.toLowerCase());
}

/**
 * Normalize a role string to lowercase.
 */
export function normalizeRole<T extends string>(role: T | null | undefined): T | null {
  if (!role || typeof role !== "string") return null;
  return role.toLowerCase().trim() as T;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE PREDICATES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if role is admin (primary admin role or superadmin sub-role).
 */
export function isAdminRole(role: EffectiveRole | string | null | undefined): boolean {
  const normalized = normalizeRole(role);
  return normalized === "admin" || normalized === "superadmin";
}

/**
 * Check if role is provider.
 */
export function isProviderRole(role: EffectiveRole | string | null | undefined): boolean {
  return normalizeRole(role) === "provider";
}

/**
 * Check if role is customer.
 */
export function isCustomerRole(role: EffectiveRole | string | null | undefined): boolean {
  return normalizeRole(role) === "customer";
}

/**
 * Check if role is provider or admin (can manage businesses).
 */
export function isProviderOrAdmin(role: EffectiveRole | string | null | undefined): boolean {
  return isProviderRole(role) || isAdminRole(role);
}

/**
 * Check if role is any staff role (has admin panel access).
 */
export function isStaffRole(role: EffectiveRole | string | null | undefined): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return VALID_ADMIN_SUB_ROLES.has(normalized) || normalized === "admin";
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE HIERARCHY HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get the hierarchy level of a role (higher = more permissions).
 */
export function getRoleLevel(role: EffectiveRole | string | null | undefined): number {
  const normalized = normalizeRole(role);
  if (!normalized) return -1;
  const index = ROLE_HIERARCHY.indexOf(normalized as EffectiveRole);
  return index >= 0 ? index : -1;
}

/**
 * Check if userRole has at least the level of requiredRole.
 */
export function hasMinimumRoleLevel(
  userRole: EffectiveRole | string | null | undefined,
  requiredRole: EffectiveRole
): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  if (userLevel < 0 || requiredLevel < 0) return false;
  return userLevel >= requiredLevel;
}

/**
 * Check if a role has access to a set of allowed roles.
 * Admin/superadmin always have access.
 */
export function hasRoleAccess(
  userRole: EffectiveRole | string | null | undefined,
  allowedRoles: readonly EffectiveRole[]
): boolean {
  const normalized = normalizeRole(userRole);
  if (!normalized) return false;
  if (isAdminRole(normalized)) return true;
  return allowedRoles.includes(normalized as EffectiveRole);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE DISPLAY
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Human-readable role labels.
 */
export const ROLE_LABELS: Record<EffectiveRole, string> = {
  customer: "Customer",
  provider: "Provider",
  admin: "Admin",
  superadmin: "Super Admin",
  support: "Support",
  moderator: "Moderator",
  finance: "Finance",
  technical_admin: "Technical Admin",
} as const;

/**
 * Get human-readable label for a role.
 */
export function getRoleLabel(role: EffectiveRole | string | null | undefined): string {
  const normalized = normalizeRole(role);
  if (!normalized || !isEffectiveRole(normalized)) return "Unknown";
  return ROLE_LABELS[normalized] || "Unknown";
}

/* ═══════════════════════════════════════════════════════════════════════════
   BACKWARD COMPATIBILITY (for existing code using SystemRole)
   ═══════════════════════════════════════════════════════════════════════════ */

/** @deprecated Use EffectiveRole instead */
export type SystemRole = EffectiveRole;

/** @deprecated Use EFFECTIVE_ROLES instead */
export const SYSTEM_ROLES = EFFECTIVE_ROLES;

/** @deprecated Use isEffectiveRole instead */
export const isValidRole = isEffectiveRole;

/** @deprecated Use isProviderOrAdmin instead */
export const isProviderOrAdminRole = isProviderOrAdmin;

/** @deprecated Use isAdminSubRole instead */
export const isAllowedAdminRole = isAdminSubRole;

/** @deprecated Use isAdminSubRole instead */
export const ALLOWED_ADMIN_ROLES = Object.values(ADMIN_SUB_ROLES);
