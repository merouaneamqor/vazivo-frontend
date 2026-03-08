/**
 * Google OAuth: URL to start "Sign in with Google" on the backend.
 * Backend redirects to Google and then to /auth/google_oauth2/callback.
 */

const LEGACY_ACCESS_TOKEN = "access_token";
const LEGACY_REFRESH_TOKEN = "refresh_token";

/** Base URL of the backend (no trailing slash). */
function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (url) return url.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    return window.location.origin;
  }
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  return url.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
}

/** Full URL to start Google OAuth (backend will redirect to Google). */
export function getGoogleAuthUrl(): string {
  const base = getBackendBaseUrl();
  return `${base}/api/v1/public/auth/google`;
}

/**
 * Set auth cookies from OAuth callback (tokens in fragment).
 * Call this on /auth/callback when the hash contains access_token.
 */
export function setAuthCookiesFromOAuth(params: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): void {
  const { access_token, refresh_token, expires_in } = params;
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  
  const domain = isProd && typeof window !== "undefined" 
    ? `; domain=.${window.location.hostname.split('.').slice(-2).join('.')}` 
    : "";
  
  const maxAgeAccess = Math.max(60, expires_in);
  const maxAgeRefresh = 7 * 24 * 60 * 60; // 7 days
  
  document.cookie = `${LEGACY_ACCESS_TOKEN}=${encodeURIComponent(access_token)}; path=/; max-age=${maxAgeAccess}; SameSite=Lax${secure}${domain}`;
  document.cookie = `${LEGACY_REFRESH_TOKEN}=${encodeURIComponent(refresh_token)}; path=/; max-age=${maxAgeRefresh}; SameSite=Lax${secure}${domain}`;
}


/**
 * Clear auth cookies on logout
 */
export function clearAuthCookies(): void {
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  const domain = isProd && typeof window !== "undefined" 
    ? `; domain=.${window.location.hostname.split('.').slice(-2).join('.')}` 
    : "";
  
  // Clear auth tokens
  document.cookie = `${LEGACY_ACCESS_TOKEN}=; path=/; max-age=0; SameSite=Lax${secure}${domain}`;
  document.cookie = `${LEGACY_REFRESH_TOKEN}=; path=/; max-age=0; SameSite=Lax${secure}${domain}`;
  
  // Clear impersonation cookies
  document.cookie = `impersonating=; path=/; max-age=0; SameSite=Lax${domain}`;
  document.cookie = `impersonated_user=; path=/; max-age=0; SameSite=Lax${domain}`;
  document.cookie = `original_admin_id=; path=/; max-age=0; SameSite=Lax${secure}${domain}`;
}
