/**
 * Next.js Proxy — Route protection + Feature flag precompute at the edge
 *
 * Two responsibilities, in order:
 *   1. AUTH ENFORCEMENT  — verify JWT session cookie, enforce route rules.
 *   2. FLAG PRECOMPUTE   — resolve all feature flags at the edge and write
 *                          each into a short-lived cookie so RSCs and Client
 *                          Components read precomputed values with zero
 *                          additional network round-trips.
 *
 * IMPORTANT: This file is intentionally self-contained with no imports from
 * packages that have a "next-js" export condition (e.g. @vercel/edge-config).
 * Those packages cause a Turbopack panic ("Next.js package not found") when
 * bundled in the proxy/middleware runtime. Feature flags are fetched via the
 * plain Edge Config REST API instead.
 *
 * @module proxy
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS — inlined to avoid importing packages with next-js export
   conditions that panic Turbopack.
   ═══════════════════════════════════════════════════════════════════════════ */

const SESSION_COOKIE_NAME = "session";
const LEGACY_ACCESS_TOKEN = "access_token";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type PrimaryRole = "customer" | "provider" | "admin";
type AdminRole = "superadmin" | "support" | "moderator" | "finance" | "technical_admin";
type EffectiveRole = PrimaryRole | AdminRole;

interface SessionPayload {
  userId: number;
  role: PrimaryRole;
  adminRole: AdminRole | null;
  effectiveRole: EffectiveRole;
  exp: number;
  iat: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   JWT HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const encodedKey = new TextEncoder().encode(
  process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    "development-secret-change-in-production"
);

async function decryptSession(cookie: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Decode legacy Rails JWT without verification (safe — proxy only makes
 * routing decisions; backend verifies on every actual API call).
 */
function decodeLegacyToken(cookie: string): SessionPayload | null {
  try {
    const parts = cookie.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    const p = JSON.parse(json) as Record<string, unknown>;

    if (typeof p.exp === "number" && p.exp * 1000 < Date.now()) return null;

    const userId = p.user_id as number | undefined;
    if (!userId) return null;

    const role = (p.role as string) || "customer";
    const adminRole = (p.admin_role as string) || null;

    return {
      userId,
      role: role as PrimaryRole,
      adminRole: adminRole as AdminRole | null,
      effectiveRole: (adminRole || role) as EffectiveRole,
      exp: (p.exp as number) || 0,
      iat: (p.iat as number) || 0,
    };
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTE AUTHORIZATION — inlined to avoid importing lib/auth/* which may
   transitively pull in packages incompatible with the edge runtime.
   ═══════════════════════════════════════════════════════════════════════════ */

type AuthDecision = { type: "allow" } | { type: "redirect"; destination: string };

function authorizeRoute(pathname: string, session: SessionPayload | null): AuthDecision {
  // Static / API — always public
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return { type: "allow" };
  }

  const isAuthenticated = Boolean(session?.userId);

  // Guest-only routes: redirect authenticated users to their dashboard
  const guestRoutes = ["/login", "/register", "/forgot-password", "/admin/login"];
  if (guestRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (isAuthenticated) {
      return { type: "redirect", destination: getPostLoginRedirect(session!.effectiveRole) };
    }
    return { type: "allow" };
  }

  // Admin routes
  if (/^\/admin/.test(pathname) && !pathname.startsWith("/admin/login")) {
    if (!isAuthenticated) return { type: "redirect", destination: "/login" };
    if (session!.role !== "admin") return { type: "redirect", destination: "/dashboard" };
    return { type: "allow" };
  }

  // Provider routes
  if (/^\/provider/.test(pathname)) {
    if (!isAuthenticated) return { type: "redirect", destination: "/login" };
    if (session!.role !== "provider" && session!.role !== "admin") {
      return { type: "redirect", destination: "/dashboard" };
    }
    return { type: "allow" };
  }

  // Authenticated-only routes
  const authRoutes = ["/dashboard", "/bookings", "/favorites", "/upgrade-to-provider"];
  if (authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (!isAuthenticated) {
      const encoded = encodeURIComponent(pathname);
      return { type: "redirect", destination: `/login?returnTo=${encoded}` };
    }
    return { type: "allow" };
  }

  // Default: public
  return { type: "allow" };
}

function getPostLoginRedirect(role: EffectiveRole | null): string {
  switch (role) {
    case "admin":
    case "superadmin":
    case "support":
    case "moderator":
    case "finance":
    case "technical_admin":
      return "/admin/dashboard";
    case "provider":
      return "/provider";
    default:
      return "/search";
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE FLAG HELPERS
   Uses the Edge Config REST API via plain fetch() — no SDK import.
   ═══════════════════════════════════════════════════════════════════════════ */

/** All flag keys with their safe fallback defaults. Kept in sync with
 *  src/shared/flags/flags.ts which uses the full SDK in Node.js runtime. */
const FLAG_DEFAULTS: Record<string, boolean> = {
  "new-booking-flow": false,
  "quick-rebook": true,
  "smart-filters": false,
  "map-view": true,
  "social-share": false,
  "story-highlights": false,
  "analytics-v2": false,
  "provider-analytics-v2": false,
  "onboarding-wizard": false,
};

/**
 * Parse the EDGE_CONFIG connection string into baseUrl + token.
 * Format: https://edge-config.vercel.com/{id}?token={token}
 */
function parseEdgeConfigUrl(
  connectionString: string
): { baseUrl: string; token: string } | null {
  try {
    const url = new URL(connectionString);
    const token = url.searchParams.get("token");
    if (!token) return null;
    // Strip query params — we'll add token as Authorization header
    url.search = "";
    return { baseUrl: url.toString(), token };
  } catch {
    return null;
  }
}

/**
 * Resolve all feature flags.
 * If EDGE_CONFIG is set, fetches the entire config in one request then
 * extracts individual values. Falls back to FLAG_DEFAULTS on any failure.
 */
async function resolveFlagValues(): Promise<Array<{ key: string; value: boolean }>> {
  const connectionString = process.env.EDGE_CONFIG;

  if (!connectionString) {
    return Object.entries(FLAG_DEFAULTS).map(([key, value]) => ({ key, value }));
  }

  const parsed = parseEdgeConfigUrl(connectionString);
  if (!parsed) {
    return Object.entries(FLAG_DEFAULTS).map(([key, value]) => ({ key, value }));
  }

  try {
    const res = await fetch(parsed.baseUrl, {
      headers: {
        Authorization: `Bearer ${parsed.token}`,
        Accept: "application/json",
      },
      // Edge Config responses are versioned — short cache is fine
      next: { revalidate: 60 },
    } as RequestInit);

    if (!res.ok) throw new Error(`Edge Config responded ${res.status}`);

    const data = (await res.json()) as { items?: Record<string, unknown> };
    const items = data.items ?? (data as Record<string, unknown>);

    return Object.entries(FLAG_DEFAULTS).map(([key, defaultValue]) => {
      const raw = (items as Record<string, unknown>)[key];
      const value = typeof raw === "boolean" ? raw : defaultValue;
      return { key, value };
    });
  } catch {
    // Flags must never block requests
    return Object.entries(FLAG_DEFAULTS).map(([key, value]) => ({ key, value }));
  }
}

/**
 * Write resolved flag values as short-lived cookies.
 * __flag_{key} = "1" (true) or "0" (false).
 * Not HttpOnly so client-side hooks can read them.
 */
function writeFlagCookies(
  response: NextResponse,
  values: Array<{ key: string; value: boolean }>
): void {
  const isProduction = process.env.NODE_ENV === "production";
  for (const { key, value } of values) {
    response.cookies.set(`__flag_${key}`, value ? "1" : "0", {
      path: "/",
      sameSite: "lax",
      maxAge: 60,
      httpOnly: false,
      secure: isProduction,
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROXY ENTRY POINT
   ═══════════════════════════════════════════════════════════════════════════ */

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // --- 1. Resolve session ---
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const legacyCookie = request.cookies.get(LEGACY_ACCESS_TOKEN)?.value;

  let session: SessionPayload | null = null;
  if (sessionCookie) session = await decryptSession(sessionCookie);
  if (!session && legacyCookie) session = decodeLegacyToken(legacyCookie);

  // --- 2. Auth enforcement ---
  const decision = authorizeRoute(pathname, session);
  if (decision.type === "redirect") {
    return NextResponse.redirect(new URL(decision.destination, request.url));
  }

  // --- 3. Build allow response ---
  const response = NextResponse.next();
  if (session?.role) {
    response.headers.set("x-user-role", session.role);
  }

  // --- 4. Feature flag precompute ---
  const flagValues = await resolveFlagValues();
  writeFlagCookies(response, flagValues);
  response.headers.set(
    "x-flags-resolved",
    flagValues.map(({ key, value }) => `${key}=${value ? "1" : "0"}`).join(",")
  );

  return response;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATCHER
   ═══════════════════════════════════════════════════════════════════════════ */

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
