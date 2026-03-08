/**
 * Session management using jose for JWT encryption/decryption.
 * Edge Runtime compatible, per official Next.js recommendations.
 *
 * @module lib/auth/session
 */

import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "./cookies";
import type { SessionPayload, PrimaryRole, AdminRole, EffectiveRole } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const secretKey = process.env.SESSION_SECRET || process.env.JWT_SECRET;
if (!secretKey) {
  console.warn("Warning: SESSION_SECRET or JWT_SECRET not set. Using fallback for development.");
}
const encodedKey = new TextEncoder().encode(secretKey || "development-secret-change-in-production");

const SESSION_EXPIRATION = "7d"; // 7 days

/* ═══════════════════════════════════════════════════════════════════════════
   ENCRYPTION / DECRYPTION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Encrypt session payload into a signed JWT.
 */
async function encrypt(payload: Omit<SessionPayload, "exp" | "iat">): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(encodedKey);
}

/**
 * Decrypt and verify a session JWT.
 * Returns null if invalid or expired.
 */
export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | null> {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECTIVE ROLE COMPUTATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Compute the effective role for routing/permissions.
 * If user is admin with a sub-role, use the sub-role; otherwise use primary role.
 */
function computeEffectiveRole(
  role: PrimaryRole,
  adminRole: AdminRole | null
): EffectiveRole {
  if (role === "admin" && adminRole) {
    return adminRole;
  }
  return role;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION COOKIE OPERATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Create a new session and set the cookie.
 * Call this after successful authentication.
 */
async function createSession(
  userId: number,
  role: PrimaryRole,
  adminRole: AdminRole | null = null
): Promise<void> {
  const effectiveRole = computeEffectiveRole(role, adminRole);
  const expiresAt = new Date(Date.now() + SESSION_COOKIE_OPTIONS.options.maxAge * 1000);

  const sessionToken = await encrypt({
    userId,
    role,
    adminRole,
    effectiveRole,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    ...SESSION_COOKIE_OPTIONS.options,
    expires: expiresAt,
  });
}

/**
 * Get the current session from cookies.
 * Returns null if no valid session exists.
 */
async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return decrypt(sessionCookie);
}

/**
 * Update/refresh the session cookie expiration.
 * Useful to extend session lifetime on user activity.
 */
async function updateSession(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const expiresAt = new Date(Date.now() + SESSION_COOKIE_OPTIONS.options.maxAge * 1000);
  const sessionToken = await encrypt({
    userId: session.userId,
    role: session.role,
    adminRole: session.adminRole,
    effectiveRole: session.effectiveRole,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    ...SESSION_COOKIE_OPTIONS.options,
    expires: expiresAt,
  });
}

/**
 * Delete the session cookie (logout).
 */
async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if a session is expired based on its exp claim.
 */
export function isSessionExpired(session: SessionPayload): boolean {
  if (!session.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= session.exp;
}
