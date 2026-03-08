/**
 * Route Configuration and Protection Rules
 *
 * Centralized, declarative route definitions for the entire application.
 * Zero magic strings. Full type safety. Single source of truth.
 *
 * @module lib/routes
 */

import { type SystemRole, SYSTEM_ROLES } from "./roles";

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE PATH CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  SEARCH: "/search",

  // Authenticated (any role)
  DASHBOARD: "/dashboard",
  ACCOUNT: "/dashboard",
  BOOKINGS: "/bookings",
  FAVORITES: "/favorites",

  // Provider-only
  PROVIDER: "/provider",
  PROVIDER_BUSINESSES: "/provider/businesses",

  // Admin-only
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_LOGIN: "/admin/login",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE PROTECTION LEVELS
   ═══════════════════════════════════════════════════════════════════════════ */

export type ProtectionLevel = "public" | "guest" | "authenticated" | "provider" | "admin";

export interface RouteRule {
  pattern: string | RegExp;
  protection: ProtectionLevel;
  allowedRoles?: readonly SystemRole[];
  redirectTo?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE RULES CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ordered route rules. First match wins.
 * Order matters: more specific patterns should come before general ones.
 */
export const ROUTE_RULES: readonly RouteRule[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // STATIC & API ROUTES (always public, bypass middleware)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: /^\/_next/, protection: "public" },
  { pattern: /^\/api/, protection: "public" },
  { pattern: /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff|woff2)$/, protection: "public" },

  // ─────────────────────────────────────────────────────────────────────────
  // GUEST-ONLY ROUTES (redirect authenticated users away)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: ROUTES.LOGIN, protection: "guest", redirectTo: ROUTES.DASHBOARD },
  { pattern: ROUTES.REGISTER, protection: "guest", redirectTo: ROUTES.DASHBOARD },
  { pattern: ROUTES.FORGOT_PASSWORD, protection: "guest", redirectTo: ROUTES.DASHBOARD },

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES (admin role only)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: ROUTES.ADMIN_LOGIN, protection: "guest", redirectTo: ROUTES.ADMIN_DASHBOARD },
  {
    pattern: /^\/admin(?!\/login)/,
    protection: "admin",
    allowedRoles: [SYSTEM_ROLES.ADMIN],
    redirectTo: ROUTES.LOGIN,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROVIDER ROUTES (provider or admin)
  // ─────────────────────────────────────────────────────────────────────────
  {
    pattern: /^\/provider/,
    protection: "provider",
    allowedRoles: [SYSTEM_ROLES.PROVIDER, SYSTEM_ROLES.ADMIN],
    redirectTo: ROUTES.DASHBOARD,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED ROUTES (any logged-in user)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: ROUTES.DASHBOARD, protection: "authenticated", redirectTo: ROUTES.LOGIN },
  { pattern: ROUTES.ACCOUNT, protection: "authenticated", redirectTo: ROUTES.LOGIN },
  { pattern: /^\/bookings/, protection: "authenticated", redirectTo: ROUTES.LOGIN },

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES (default)
  // ─────────────────────────────────────────────────────────────────────────
  { pattern: /.*/, protection: "public" },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE MATCHING UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Find the matching route rule for a given pathname
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
 * Check if a pathname matches any of the given route patterns
 */
export function matchesAnyRoute(pathname: string, patterns: readonly (string | RegExp)[]): boolean {
  return patterns.some((pattern) =>
    typeof pattern === "string"
      ? pathname === pattern || pathname.startsWith(pattern + "/")
      : pattern.test(pathname)
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Build a redirect URL with optional return path
 */
export function buildRedirectUrl(targetPath: string, returnTo?: string): string {
  if (!returnTo || returnTo === targetPath) {
    return targetPath;
  }
  const encoded = encodeURIComponent(returnTo);
  return `${targetPath}?returnTo=${encoded}`;
}

/**
 * Extract return path from URL search params
 */
export function extractReturnPath(searchParams: URLSearchParams): string | null {
  const returnTo = searchParams.get("returnTo");
  if (!returnTo) return null;

  // Security: only allow relative paths
  if (returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return decodeURIComponent(returnTo);
  }

  return null;
}

/**
 * Get the default redirect path for a given role after login
 */
export function getPostLoginRedirect(role: SystemRole | null): string {
  switch (role) {
    case SYSTEM_ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case SYSTEM_ROLES.PROVIDER:
      return ROUTES.PROVIDER;
    case SYSTEM_ROLES.CUSTOMER:
    default:
      return ROUTES.DASHBOARD;
  }
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const rule = findRouteRule(pathname);
  return rule.protection === "authenticated" || rule.protection === "provider" || rule.protection === "admin";
}

/**
 * Check if a route is guest-only (login, register)
 */
export function isGuestRoute(pathname: string): boolean {
  const rule = findRouteRule(pathname);
  return rule.protection === "guest";
}
