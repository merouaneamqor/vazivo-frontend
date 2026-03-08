/**
 * JWT Utilities for Edge Runtime (Middleware)
 *
 * Edge-compatible JWT parsing without external dependencies.
 * Does NOT verify signatures — that's the backend's responsibility.
 * This module extracts claims for routing decisions only.
 *
 * @module lib/jwt
 */

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface JWTHeader {
  alg: string;
  typ: string;
}

export interface JWTPayload {
  sub?: string;
  user_id?: number;
  role?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface ParsedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}

export interface JWTValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: JWTPayload | null;
  error?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const JWT_PARTS_COUNT = 3;
const EXPIRATION_BUFFER_SECONDS = 30; // Consider token expired 30s before actual expiry

/* ═══════════════════════════════════════════════════════════════════════════
   PURE FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Decode base64url to string (Edge-compatible)
 */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof atob === "function") {
    return atob(padded);
  }

  // Fallback for environments without atob
  return Buffer.from(padded, "base64").toString("utf-8");
}

/**
 * Parse a JSON string safely
 */
function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Check if a timestamp (in seconds) is expired
 */
function isTimestampExpired(exp: number, bufferSeconds: number = EXPIRATION_BUFFER_SECONDS): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp - bufferSeconds;
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTED FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Parse a JWT token into its components without verification.
 * Returns null if the token is malformed.
 */
export function parseJWT(token: string): ParsedJWT | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== JWT_PARTS_COUNT) {
    return null;
  }

  const [headerB64, payloadB64, signature] = parts;

  try {
    const headerJson = base64UrlDecode(headerB64);
    const payloadJson = base64UrlDecode(payloadB64);

    const header = safeJsonParse<JWTHeader>(headerJson);
    const payload = safeJsonParse<JWTPayload>(payloadJson);

    if (!header || !payload) {
      return null;
    }

    return { header, payload, signature };
  } catch {
    return null;
  }
}

/**
 * Extract and validate JWT payload for routing decisions.
 * Does NOT cryptographically verify the token.
 */
export function validateJWTForRouting(token: string | undefined | null): JWTValidationResult {
  if (!token) {
    return {
      isValid: false,
      isExpired: false,
      payload: null,
      error: "No token provided",
    };
  }

  const parsed = parseJWT(token);

  if (!parsed) {
    return {
      isValid: false,
      isExpired: false,
      payload: null,
      error: "Malformed token",
    };
  }

  const { payload } = parsed;

  // Check expiration if present
  if (payload.exp && isTimestampExpired(payload.exp)) {
    return {
      isValid: false,
      isExpired: true,
      payload,
      error: "Token expired",
    };
  }

  return {
    isValid: true,
    isExpired: false,
    payload,
  };
}

/**
 * Extract user ID from JWT payload
 */
export function extractUserId(payload: JWTPayload | null): number | null {
  if (!payload) return null;

  // Try user_id first, then sub (standard JWT claim)
  if (typeof payload.user_id === "number") {
    return payload.user_id;
  }

  if (payload.sub) {
    const parsed = parseInt(payload.sub, 10);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

/**
 * Extract role from JWT payload
 */
export function extractRole(payload: JWTPayload | null): string | null {
  if (!payload) return null;
  return typeof payload.role === "string" ? payload.role : null;
}

/**
 * Check if token will expire within the given seconds
 */
export function willExpireSoon(token: string, withinSeconds: number = 300): boolean {
  const parsed = parseJWT(token);
  if (!parsed?.payload.exp) return false;
  return isTimestampExpired(parsed.payload.exp, withinSeconds);
}
