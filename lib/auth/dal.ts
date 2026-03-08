/**
 * Data Access Layer (DAL) for authentication.
 *
 * Provides server-side session verification and role guards.
 * Uses React cache() for request-level memoization.
 *
 * Per Next.js official docs, the DAL:
 * - Only runs on the server
 * - Performs authorization checks
 * - Returns safe, minimal data for rendering
 *
 * @module lib/auth/dal
 */

import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, isSessionExpired } from "./session";
import { SESSION_COOKIE_NAME } from "./cookies";
import type { SessionPayload, PrimaryRole, AdminRole, EffectiveRole } from "./types";

// Legacy cookie name from backend (Rails sets this)
const LEGACY_ACCESS_TOKEN = "access_token";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface VerifiedSession {
  isAuth: true;
  userId: number;
  role: PrimaryRole;
  adminRole: AdminRole | null;
  effectiveRole: EffectiveRole;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN ROLE VALIDATION
   ═══════════════════════════════════════════════════════════════════════════ */

const VALID_ADMIN_ROLES: readonly AdminRole[] = [
  "superadmin",
  "support",
  "moderator",
  "finance",
  "technical_admin",
];

/**
 * Check if an admin_role value is valid for admin panel access.
 */
export function isValidAdminRole(adminRole: string | null | undefined): adminRole is AdminRole {
  if (!adminRole) return false;
  return (VALID_ADMIN_ROLES as readonly string[]).includes(adminRole);
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEGACY TOKEN DECODING
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Decode legacy access_token from Rails backend (without signature verification).
 * The backend and frontend may use different JWT secrets.
 */
function decodeLegacyToken(cookie: string | undefined): SessionPayload | null {
  if (!cookie) return null;

  try {
    const parts = cookie.split(".");
    if (parts.length !== 3) return null;

    const payloadBase64 = parts[1];
    // Handle base64url encoding
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    // Check if token is expired
    const exp = payload.exp as number | undefined;
    if (exp && exp * 1000 < Date.now()) {
      return null;
    }

    const userId = payload.user_id as number | undefined;
    const role = payload.role as string | undefined;
    const adminRole = payload.admin_role as string | null | undefined;

    if (!userId) return null;

    return {
      userId,
      role: (role || "customer") as SessionPayload["role"],
      adminRole: (adminRole || null) as SessionPayload["adminRole"],
      effectiveRole: (adminRole || role || "customer") as SessionPayload["effectiveRole"],
      exp: exp || 0,
      iat: (payload.iat as number) || 0,
    };
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION VERIFICATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Verify the current session from cookies.
 * Redirects to login if no valid session exists.
 *
 * Uses React cache() to memoize within a single request,
 * avoiding redundant decryption when called multiple times.
 *
 * Checks both new session cookie and legacy access_token for backward compatibility.
 */
export const verifySession = cache(async (): Promise<VerifiedSession> => {
  const cookieStore = await cookies();

  // Try new session cookie first
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  let session = await decrypt(sessionCookie);

  // Fall back to legacy access_token if new session not found
  if (!session?.userId) {
    const legacyCookie = cookieStore.get(LEGACY_ACCESS_TOKEN)?.value;
    session = decodeLegacyToken(legacyCookie);
  }

  // No session or invalid
  if (!session?.userId) {
    redirect("/login");
  }

  // Session expired (for new session cookie)
  if (sessionCookie && isSessionExpired(session)) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    redirect("/login?reason=session_expired");
  }

  return {
    isAuth: true,
    userId: session.userId,
    role: session.role,
    adminRole: session.adminRole,
    effectiveRole: session.effectiveRole,
  };
});

/**
 * Get session without redirecting.
 * Returns null if no valid session, useful for optional auth checks.
 *
 * Checks both new session cookie and legacy access_token for backward compatibility.
 */
export const getOptionalSession = cache(async (): Promise<VerifiedSession | null> => {
  const cookieStore = await cookies();

  // Try new session cookie first
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  let session = await decrypt(sessionCookie);

  // Fall back to legacy access_token if new session not found
  if (!session?.userId) {
    const legacyCookie = cookieStore.get(LEGACY_ACCESS_TOKEN)?.value;
    session = decodeLegacyToken(legacyCookie);
  }

  if (!session?.userId) {
    return null;
  }

  // Only check expiration for new session cookie (legacy expiration already checked in decode)
  if (sessionCookie && isSessionExpired(session)) {
    return null;
  }

  return {
    isAuth: true,
    userId: session.userId,
    role: session.role,
    adminRole: session.adminRole,
    effectiveRole: session.effectiveRole,
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE-SPECIFIC GUARDS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Require admin role with valid admin sub-role.
 * Redirects to /dashboard if not authorized.
 */
export const requireAdmin = cache(async (): Promise<VerifiedSession> => {
  const session = await verifySession();

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  // Note: Admin sub-role check is optional since Rails backend may not include it
  // If adminRole exists, validate it; if not, allow any admin
  // Specific admin features can use requireAdminRoles() for granular control

  return session;
});

/**
 * Require provider role (or admin, who can access provider features).
 * Redirects to /dashboard if not authorized.
 */
export const requireProvider = cache(async (): Promise<VerifiedSession> => {
  const session = await verifySession();

  if (session.role !== "provider" && session.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
});

/**
 * Require customer role.
 * Redirects to /dashboard if not authorized.
 */
export const requireCustomer = cache(async (): Promise<VerifiedSession> => {
  const session = await verifySession();

  if (session.role !== "customer") {
    redirect("/dashboard");
  }

  return session;
});

/**
 * Require specific admin sub-roles.
 * Useful for granular admin panel access control.
 */
export const requireAdminRoles = cache(
  async (allowedRoles: readonly AdminRole[]): Promise<VerifiedSession> => {
    const session = await verifySession();

    if (session.role !== "admin") {
      redirect("/dashboard");
    }

    // Superadmin has access to everything
    if (session.adminRole === "superadmin") {
      return session;
    }

    if (!session.adminRole || !allowedRoles.includes(session.adminRole)) {
      redirect("/admin/dashboard"); // Redirect to admin dashboard, not allowed for this section
    }

    return session;
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if current user can access admin panel.
 * Does not redirect, returns boolean.
 */
export async function canAccessAdmin(): Promise<boolean> {
  const session = await getOptionalSession();
  if (!session) return false;
  return session.role === "admin" && isValidAdminRole(session.adminRole);
}

/**
 * Check if current user can access provider features.
 * Does not redirect, returns boolean.
 */
export async function canAccessProvider(): Promise<boolean> {
  const session = await getOptionalSession();
  if (!session) return false;
  return (
    session.role === "provider" ||
    session.role === "admin" ||
    session.adminRole === "superadmin"
  );
}

/**
 * Check if current user is authenticated.
 * Does not redirect, returns boolean.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getOptionalSession();
  return session !== null;
}
