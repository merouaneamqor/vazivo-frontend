/**
 * Authentication Context & Middleware Helpers
 *
 * Re-exports from lib/auth/ for backward compatibility.
 * New code should import from "@/lib/auth/index".
 *
 * @module lib/auth
 * @deprecated Import from "@/lib/auth/index" instead
 */

import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { EffectiveRole, SessionPayload } from "./auth/types";
import { SESSION_COOKIE_NAME } from "./auth/cookies";
import {
  ROUTES,
  buildRedirectUrl,
  findRouteRule,
  type RouteRule,
  type ProtectionLevel,
  type AuthDecision as NewAuthDecision,
} from "./auth/route-rules";
import {
  isAdminRole,
  isProviderOrAdmin,
  hasRoleAccess,
  normalizeRole,
} from "./auth/roles";

// Re-export from new auth module
;
;

// Re-export types from roles for backward compatibility
;

/* ═══════════════════════════════════════════════════════════════════════════
   COOKIE CONSTANTS (Legacy - kept for backward compatibility)
   ═══════════════════════════════════════════════════════════════════════════ */

const AUTH_COOKIES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Authentication context extracted from request
 * @deprecated Use SessionPayload from lib/auth instead
 */
interface AuthContext {
  isAuthenticated: boolean;
  userId: number | null;
  role: EffectiveRole | null;
  hasValidToken: boolean;
  isTokenExpired: boolean;
}

/**
 * Authorization decision for a route
 */
type AuthDecision =
  | { type: "allow" }
  | { type: "redirect"; destination: string }
  | { type: "unauthorized"; reason: string };

/**
 * Full request context for middleware
 */
interface RequestContext {
  auth: AuthContext;
  pathname: string;
  rule: RouteRule;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION DECRYPTION (for legacy middleware/proxy)
   ═══════════════════════════════════════════════════════════════════════════ */

const secretKey = process.env.SESSION_SECRET || process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey || "development-secret-change-in-production");

async function decryptSessionFromCookie(cookie: string | undefined): Promise<SessionPayload | null> {
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTEXT EXTRACTION (Pure Functions)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Extract authentication context from request headers/cookies.
 * Pure function — no side effects, no external calls.
 * @deprecated Use session decryption from lib/auth/session instead
 */
function createAuthContext(request: NextRequest): AuthContext {
  // Try new session cookie first
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  // Synchronously check if cookie exists (we can't await in this context for backward compat)
  if (sessionCookie) {
    // For backward compatibility, we need to return a sync result
    // This is a limitation - new code should use async session decryption
    return {
      isAuthenticated: true, // Optimistic - will be verified by proxy
      userId: null,
      role: null,
      hasValidToken: true,
      isTokenExpired: false,
    };
  }

  // Fallback to legacy access_token cookie
  const accessToken = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    return {
      isAuthenticated: false,
      userId: null,
      role: null,
      hasValidToken: false,
      isTokenExpired: false,
    };
  }

  // For legacy tokens, we do basic parsing (no verification in sync context)
  return {
    isAuthenticated: true,
    userId: null,
    role: null,
    hasValidToken: true,
    isTokenExpired: false,
  };
}

/**
 * Create full request context for middleware decision-making
 * @deprecated Use authorizeRoute from lib/auth/route-rules instead
 */
function createRequestContext(request: NextRequest): RequestContext {
  const pathname = request.nextUrl.pathname;
  const auth = createAuthContext(request);
  const rule = findRouteRule(pathname);

  return { auth, pathname, rule };
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHORIZATION LOGIC (Pure Functions)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Determine if a user can access a route based on protection level and role.
 * Returns an authorization decision — no side effects.
 * @deprecated Use authorizeRoute from lib/auth/route-rules instead
 */
function authorizeRoute(context: RequestContext): AuthDecision {
  const { auth, pathname, rule } = context;
  const { protection, allowedRoles, redirectTo } = rule;

  // PUBLIC ROUTES: Always allow
  if (protection === "public") {
    return { type: "allow" };
  }

  // GUEST ROUTES: Redirect authenticated users away
  if (protection === "guest") {
    if (auth.isAuthenticated) {
      return {
        type: "redirect",
        destination: redirectTo || ROUTES.DASHBOARD,
      };
    }
    return { type: "allow" };
  }

  // PROTECTED ROUTES: Require authentication
  if (!auth.isAuthenticated) {
    return {
      type: "redirect",
      destination: buildRedirectUrl(redirectTo || ROUTES.LOGIN, pathname),
    };
  }

  // ROLE-BASED ROUTES: Check specific role requirements
  if (protection === "admin") {
    if (!isAdminRole(auth.role)) {
      return {
        type: "redirect",
        destination: ROUTES.DASHBOARD,
      };
    }
    return { type: "allow" };
  }

  if (protection === "provider") {
    if (!isProviderOrAdmin(auth.role)) {
      return {
        type: "redirect",
        destination: ROUTES.DASHBOARD,
      };
    }
    return { type: "allow" };
  }

  // AUTHENTICATED ROUTES: Any logged-in user
  if (protection === "authenticated") {
    return { type: "allow" };
  }

  // CUSTOM ROLE LISTS: Check against allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRoleAccess(auth.role, allowedRoles as readonly EffectiveRole[])) {
      return {
        type: "redirect",
        destination: redirectTo || ROUTES.DASHBOARD,
      };
    }
  }

  return { type: "allow" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENT-SIDE AUTH STATE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Auth state machine phases
 */
type AuthPhase = "initializing" | "checking" | "authenticated" | "unauthenticated";

/**
 * Client-side auth state interface
 */
interface AuthState {
  phase: AuthPhase;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
}

/**
 * Derive loading/ready states from phase
 */
function deriveAuthState(phase: AuthPhase, hasUser: boolean): AuthState {
  switch (phase) {
    case "initializing":
      return { phase, isAuthenticated: false, isLoading: true, isReady: false };
    case "checking":
      return { phase, isAuthenticated: false, isLoading: true, isReady: false };
    case "authenticated":
      return { phase, isAuthenticated: true, isLoading: false, isReady: true };
    case "unauthenticated":
      return { phase, isAuthenticated: false, isLoading: false, isReady: true };
    default:
      return { phase: "initializing", isAuthenticated: hasUser, isLoading: true, isReady: false };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   GUARD HELPERS (for use in components)
   ═══════════════════════════════════════════════════════════════════════════ */

interface GuardResult {
  allowed: boolean;
  redirectTo: string | null;
  reason?: string;
}

/**
 * Check if user can access provider routes
 */
export function canAccessProvider(
  isAuthenticated: boolean,
  role: EffectiveRole | null
): GuardResult {
  if (!isAuthenticated) {
    return { allowed: false, redirectTo: ROUTES.LOGIN, reason: "Not authenticated" };
  }

  if (!isProviderOrAdmin(role)) {
    return { allowed: false, redirectTo: ROUTES.DASHBOARD, reason: "Insufficient permissions" };
  }

  return { allowed: true, redirectTo: null };
}

/**
 * Check if user can access admin routes
 */
export function canAccessAdmin(
  isAuthenticated: boolean,
  role: EffectiveRole | null
): GuardResult {
  if (!isAuthenticated) {
    return { allowed: false, redirectTo: ROUTES.ADMIN_LOGIN, reason: "Not authenticated" };
  }

  if (!isAdminRole(role)) {
    return { allowed: false, redirectTo: ROUTES.DASHBOARD, reason: "Insufficient permissions" };
  }

  return { allowed: true, redirectTo: null };
}

/**
 * Check if user can access authenticated routes
 */
export function canAccessAuthenticated(isAuthenticated: boolean): GuardResult {
  if (!isAuthenticated) {
    return { allowed: false, redirectTo: ROUTES.LOGIN, reason: "Not authenticated" };
  }

  return { allowed: true, redirectTo: null };
}
