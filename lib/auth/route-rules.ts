/**
 * Declarative route protection rules for proxy.ts.
 *
 * Defines which routes require authentication and what roles can access them.
 * Rules are evaluated in order; first match wins.
 *
 * @module lib/auth/route-rules
 */

import type { SessionPayload, EffectiveRole } from "./types";
import { isAdminSubRole } from "./roles";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type ProtectionLevel = "public" | "guest" | "authenticated" | "provider" | "admin";

export interface RouteRule {
  /** URL pattern to match (string for exact/prefix, RegExp for pattern) */
  pattern: string | RegExp;
  /** Protection level for this route */
  protection: ProtectionLevel;
  /** Custom validation function (optional, for complex logic) */
  validate?: (session: SessionPayload) => boolean;
  /** Allowed roles (optional, for role-specific routes) */
  allowedRoles?: readonly EffectiveRole[];
  /** Redirect destination when access denied */
  redirectTo?: string;
}

export interface AuthDecision {
  type: "allow" | "redirect";
  destination?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

export const ROUTES = {
  // Public
  HOME: "/",
  SEARCH: "/search",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Protected (any authenticated user)
  DASHBOARD: "/dashboard",
  ACCOUNT: "/dashboard",
  BOOKINGS: "/bookings",
  FAVORITES: "/favorites",

  // Provider
  PROVIDER: "/provider",

  // Admin
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE RULES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ordered route rules. First match wins.
 * More specific patterns should come before general ones.
 */
export const ROUTE_RULES: readonly RouteRule[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // STATIC & API ROUTES (always public, bypass protection)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: /^\/_next/, protection: "public" },
  { pattern: /^\/api/, protection: "public" },
  { pattern: /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff|woff2)$/, protection: "public" },

  // ─────────────────────────────────────────────────────────────────────────
  // GUEST-ONLY ROUTES (redirect authenticated users away)
  // ─────────────────────────────────────────────────────────────────────────
  {
    pattern: ROUTES.LOGIN,
    protection: "guest",
    redirectTo: ROUTES.DASHBOARD,
  },
  {
    pattern: ROUTES.REGISTER,
    protection: "guest",
    redirectTo: ROUTES.DASHBOARD,
  },
  {
    pattern: ROUTES.FORGOT_PASSWORD,
    protection: "guest",
    redirectTo: ROUTES.DASHBOARD,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USER ROUTES (authenticated users)
  // ─────────────────────────────────────────────────────────────────────────
  {
    pattern: "/upgrade-to-provider",
    protection: "authenticated",
    validate: (session) => session.role === "customer",
    redirectTo: ROUTES.DASHBOARD,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  {
    pattern: ROUTES.ADMIN_LOGIN,
    protection: "guest",
    redirectTo: ROUTES.ADMIN_DASHBOARD,
  },
  {
    pattern: /^\/admin(?!\/login)/,
    protection: "admin",
    // Allow any admin role at proxy level - server-side DAL enforces sub-role requirements
    // Rails JWT may not include admin_role, so we only check primary role here
    validate: (session) => session.role === "admin",
    redirectTo: ROUTES.DASHBOARD, // Non-admins go to dashboard, not login
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROVIDER ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  {
    pattern: /^\/provider/,
    protection: "provider",
    validate: (session) =>
      session.role === "provider" ||
      session.role === "admin" ||
      session.adminRole === "superadmin",
    redirectTo: ROUTES.DASHBOARD,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED ROUTES (any logged-in user)
  // ─────────────────────────────────────────────────────────────────────────
  {
    pattern: ROUTES.DASHBOARD,
    protection: "authenticated",
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: ROUTES.ACCOUNT,
    protection: "authenticated",
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: /^\/bookings/,
    protection: "authenticated",
    redirectTo: ROUTES.LOGIN,
  },
  {
    pattern: ROUTES.FAVORITES,
    protection: "authenticated",
    redirectTo: ROUTES.LOGIN,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES (default fallback)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: /.*/, protection: "public" },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE MATCHING
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Find the matching route rule for a given pathname.
 */
export function findRouteRule(pathname: string): RouteRule {
  for (const rule of ROUTE_RULES) {
    const matches =
      typeof rule.pattern === "string"
        ? pathname === rule.pattern || pathname.startsWith(rule.pattern + "/")
        : rule.pattern.test(pathname);

    if (matches) {
      return rule;
    }
  }

  // Default to public (last rule should catch all, but safety fallback)
  return { pattern: /.*/, protection: "public" };
}

/**
 * Build a redirect URL with optional returnTo parameter.
 */
export function buildRedirectUrl(targetPath: string, returnTo?: string): string {
  if (!returnTo || returnTo === targetPath) {
    return targetPath;
  }
  // Security: only allow relative paths
  if (returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    const encoded = encodeURIComponent(returnTo);
    return `${targetPath}?returnTo=${encoded}`;
  }
  return targetPath;
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHORIZATION LOGIC
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Determine if a session can access a route.
 * Pure function with no side effects.
 */
export function authorizeRoute(
  pathname: string,
  session: SessionPayload | null
): AuthDecision {
  const rule = findRouteRule(pathname);
  const { protection, validate, redirectTo } = rule;

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES: Always allow
  // ─────────────────────────────────────────────────────────────────────────
  if (protection === "public") {
    return { type: "allow" };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GUEST ROUTES: Redirect authenticated users away
  // ─────────────────────────────────────────────────────────────────────────
  if (protection === "guest") {
    if (session?.userId) {
      // Redirect to role-specific dashboard
      const destination = redirectTo || getPostLoginRedirect(session.effectiveRole);
      return {
        type: "redirect",
        destination,
      };
    }
    return { type: "allow" };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROTECTED ROUTES: Require authentication
  // ─────────────────────────────────────────────────────────────────────────
  if (!session?.userId) {
    return {
      type: "redirect",
      destination: buildRedirectUrl(redirectTo || ROUTES.LOGIN, pathname),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOM VALIDATION: Use validate function if provided
  // ─────────────────────────────────────────────────────────────────────────
  if (validate && !validate(session)) {
    return {
      type: "redirect",
      destination: redirectTo || ROUTES.DASHBOARD,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROLE-BASED VALIDATION: Check protection level
  // ─────────────────────────────────────────────────────────────────────────
  if (protection === "admin") {
    if (session.role !== "admin") {
      return {
        type: "redirect",
        destination: ROUTES.DASHBOARD,
      };
    }
    return { type: "allow" };
  }

  if (protection === "provider") {
    if (session.role !== "provider" && session.role !== "admin") {
      return {
        type: "redirect",
        destination: ROUTES.DASHBOARD,
      };
    }
    return { type: "allow" };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED: Any logged-in user
  // ─────────────────────────────────────────────────────────────────────────
  return { type: "allow" };
}

/**
 * Get the default redirect path for a given role after login.
 */
export function getPostLoginRedirect(role: EffectiveRole | null): string {
  switch (role) {
    case "admin":
    case "superadmin":
    case "support":
    case "moderator":
    case "finance":
    case "technical_admin":
      return ROUTES.ADMIN_DASHBOARD;
    case "provider":
      return ROUTES.PROVIDER;
    case "customer":
    default:
      return ROUTES.SEARCH;
  }
}
