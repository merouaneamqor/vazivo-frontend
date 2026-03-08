/**
 * Permission system for fine-grained authorization.
 *
 * Maps effective roles to specific capabilities.
 * Used by authorize() helper for Server Action guards.
 *
 * @module lib/auth/permissions
 */

import type { EffectiveRole } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   PERMISSION DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * All available permissions in the system.
 * Format: "resource:action" or "resource:action:scope"
 */
export const PERMISSIONS = {
  // Wildcard (full access)
  ALL: "*",

  // Booking permissions
  BOOKINGS_CREATE: "bookings:create",
  BOOKINGS_READ_OWN: "bookings:read:own",
  BOOKINGS_READ_ALL: "bookings:read:all",
  BOOKINGS_UPDATE_OWN: "bookings:update:own",
  BOOKINGS_UPDATE_ALL: "bookings:update:all",
  BOOKINGS_CANCEL_OWN: "bookings:cancel:own",
  BOOKINGS_CANCEL_ALL: "bookings:cancel:all",

  // Business permissions
  BUSINESSES_READ: "businesses:read",
  BUSINESSES_MANAGE_OWN: "businesses:manage:own",
  BUSINESSES_MANAGE_ALL: "businesses:manage:all",

  // Service permissions
  SERVICES_READ: "services:read",
  SERVICES_MANAGE: "services:manage",

  // Review permissions
  REVIEWS_CREATE: "reviews:create",
  REVIEWS_READ: "reviews:read",
  REVIEWS_MODERATE: "reviews:moderate",

  // User permissions
  USERS_READ: "users:read",
  USERS_MANAGE: "users:manage",
  USERS_DELETE: "users:delete",

  // Admin panel access
  ADMIN_ACCESS: "admin:access",

  // Support permissions
  TICKETS_READ: "tickets:read",
  TICKETS_MANAGE: "tickets:manage",

  // Reports permissions
  REPORTS_READ: "reports:read",
  REPORTS_MANAGE: "reports:manage",

  // Finance permissions
  PAYOUTS_READ: "payouts:read",
  PAYOUTS_MANAGE: "payouts:manage",
  REVENUE_READ: "revenue:read",

  // System permissions
  SYSTEM_SETTINGS: "system:settings",
  LOGS_READ: "logs:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE-PERMISSION MAPPING
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Maps each effective role to its granted permissions.
 */
export const ROLE_PERMISSIONS: Record<EffectiveRole, readonly Permission[]> = {
  // Customer: Can book services and manage own bookings
  customer: [
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_READ_OWN,
    PERMISSIONS.BOOKINGS_UPDATE_OWN,
    PERMISSIONS.BOOKINGS_CANCEL_OWN,
    PERMISSIONS.BUSINESSES_READ,
    PERMISSIONS.SERVICES_READ,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_READ,
  ],

  // Provider: Can manage businesses + customer capabilities
  provider: [
    // Customer permissions
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_READ_OWN,
    PERMISSIONS.BOOKINGS_UPDATE_OWN,
    PERMISSIONS.BOOKINGS_CANCEL_OWN,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_READ,
    // Provider-specific
    PERMISSIONS.BUSINESSES_READ,
    PERMISSIONS.BUSINESSES_MANAGE_OWN,
    PERMISSIONS.SERVICES_READ,
    PERMISSIONS.SERVICES_MANAGE,
  ],

  // Support: Admin panel with support ticket access
  support: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.TICKETS_READ,
    PERMISSIONS.TICKETS_MANAGE,
    PERMISSIONS.BOOKINGS_READ_ALL,
  ],

  // Moderator: Admin panel with review/report moderation
  moderator: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.REVIEWS_READ,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_MANAGE,
    PERMISSIONS.USERS_READ,
  ],

  // Finance: Admin panel with financial access
  finance: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.PAYOUTS_READ,
    PERMISSIONS.PAYOUTS_MANAGE,
    PERMISSIONS.REVENUE_READ,
    PERMISSIONS.BOOKINGS_READ_ALL,
  ],

  // Technical Admin: Admin panel with system access
  technical_admin: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.LOGS_READ,
    PERMISSIONS.USERS_READ,
  ],

  // Admin (legacy): Full admin panel access
  admin: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.BUSINESSES_READ,
    PERMISSIONS.BUSINESSES_MANAGE_ALL,
    PERMISSIONS.BOOKINGS_READ_ALL,
    PERMISSIONS.BOOKINGS_UPDATE_ALL,
    PERMISSIONS.BOOKINGS_CANCEL_ALL,
    PERMISSIONS.REVIEWS_READ,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.SERVICES_READ,
    PERMISSIONS.SERVICES_MANAGE,
  ],

  // Superadmin: Full access to everything
  superadmin: [PERMISSIONS.ALL],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   PERMISSION CHECKING
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: EffectiveRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  // Wildcard grants all permissions
  if (permissions.includes(PERMISSIONS.ALL)) return true;

  return permissions.includes(permission);
}

/**
 * Check if a role has all of the specified permissions.
 */
export function hasAllPermissions(role: EffectiveRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions.
 */
export function hasAnyPermission(role: EffectiveRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: EffectiveRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
