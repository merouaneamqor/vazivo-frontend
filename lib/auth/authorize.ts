/**
 * Authorization Helpers for Server Actions & Route Handlers
 *
 * Provides permission-based guards for secure data mutations.
 * Uses the DAL for session verification and permissions for access control.
 *
 * @module lib/auth/authorize
 */

import "server-only";
import { verifySession, getOptionalSession, type VerifiedSession } from "./dal";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
} from "./permissions";
import type { EffectiveRole } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  public readonly requiredPermission?: Permission;
  public readonly userRole?: EffectiveRole;

  constructor(
    message = "Forbidden",
    options?: { requiredPermission?: Permission; userRole?: EffectiveRole }
  ) {
    super(message);
    this.name = "ForbiddenError";
    this.requiredPermission = options?.requiredPermission;
    this.userRole = options?.userRole;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PERMISSION-BASED AUTHORIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Authorize a Server Action or Route Handler for a specific permission.
 * Throws UnauthorizedError if not logged in, ForbiddenError if permission denied.
 *
 * @example
 * // In a Server Action:
 * export async function deleteUser(userId: number) {
 *   'use server';
 *   await authorize('users:delete');
 *   // ... proceed with deletion
 * }
 */
export async function authorize(requiredPermission: Permission): Promise<VerifiedSession> {
  const session = await verifySession();

  if (!hasPermission(session.effectiveRole, requiredPermission)) {
    throw new ForbiddenError(
      `Permission denied: ${requiredPermission} required`,
      {
        requiredPermission,
        userRole: session.effectiveRole,
      }
    );
  }

  return session;
}

/**
 * Authorize for multiple permissions (all must be present).
 *
 * @example
 * await authorizeAll(['users:read', 'users:manage']);
 */
export async function authorizeAll(permissions: Permission[]): Promise<VerifiedSession> {
  const session = await verifySession();

  if (!hasAllPermissions(session.effectiveRole, permissions)) {
    throw new ForbiddenError(
      `Permission denied: all of [${permissions.join(", ")}] required`,
      { userRole: session.effectiveRole }
    );
  }

  return session;
}

/**
 * Authorize for any of the specified permissions (at least one must be present).
 *
 * @example
 * await authorizeAny(['reviews:moderate', 'admin:access']);
 */
export async function authorizeAny(permissions: Permission[]): Promise<VerifiedSession> {
  const session = await verifySession();

  if (!hasAnyPermission(session.effectiveRole, permissions)) {
    throw new ForbiddenError(
      `Permission denied: one of [${permissions.join(", ")}] required`,
      { userRole: session.effectiveRole }
    );
  }

  return session;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE-BASED AUTHORIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Authorize for a specific role.
 *
 * @example
 * await authorizeRole('admin');
 */
export async function authorizeRole(role: EffectiveRole): Promise<VerifiedSession> {
  const session = await verifySession();

  if (session.effectiveRole !== role && session.effectiveRole !== "superadmin") {
    throw new ForbiddenError(`Role required: ${role}`, { userRole: session.effectiveRole });
  }

  return session;
}

/**
 * Authorize for any of the specified roles.
 *
 * @example
 * await authorizeRoles(['admin', 'superadmin', 'moderator']);
 */
export async function authorizeRoles(roles: EffectiveRole[]): Promise<VerifiedSession> {
  const session = await verifySession();

  // Superadmin always passes
  if (session.effectiveRole === "superadmin") {
    return session;
  }

  if (!roles.includes(session.effectiveRole)) {
    throw new ForbiddenError(
      `One of these roles required: [${roles.join(", ")}]`,
      { userRole: session.effectiveRole }
    );
  }

  return session;
}

/* ═══════════════════════════════════════════════════════════════════════════
   OWNERSHIP-BASED AUTHORIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Authorize if user owns the resource or has admin access.
 * Useful for "own or admin" patterns.
 *
 * @example
 * await authorizeOwnerOrAdmin(booking.userId, 'bookings:update:all');
 */
export async function authorizeOwnerOrAdmin(
  resourceOwnerId: number,
  adminPermission: Permission
): Promise<VerifiedSession> {
  const session = await verifySession();

  // Owner can access
  if (session.userId === resourceOwnerId) {
    return session;
  }

  // Admin with permission can access
  if (hasPermission(session.effectiveRole, adminPermission)) {
    return session;
  }

  throw new ForbiddenError("You can only access your own resources");
}

/**
 * Check authorization without throwing (returns boolean).
 * Useful for conditional UI or optional access.
 *
 * @example
 * if (await canAccess('users:delete')) {
 *   // show delete button
 * }
 */
export async function canAccess(permission: Permission): Promise<boolean> {
  const session = await getOptionalSession();
  if (!session) return false;
  return hasPermission(session.effectiveRole, permission);
}

/**
 * Check if current user is the owner or has admin access.
 *
 * @example
 * if (await canAccessOwnerOrAdmin(resource.userId, 'resources:manage:all')) {
 *   // show edit controls
 * }
 */
export async function canAccessOwnerOrAdmin(
  resourceOwnerId: number,
  adminPermission: Permission
): Promise<boolean> {
  const session = await getOptionalSession();
  if (!session) return false;

  if (session.userId === resourceOwnerId) return true;
  return hasPermission(session.effectiveRole, adminPermission);
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get current user ID from session (throws if not authenticated).
 * Useful when you just need the user ID without full authorization.
 */
export async function getCurrentUserId(): Promise<number> {
  const session = await verifySession();
  return session.userId;
}

/**
 * Get current user role from session (throws if not authenticated).
 */
export async function getCurrentRole(): Promise<EffectiveRole> {
  const session = await verifySession();
  return session.effectiveRole;
}
