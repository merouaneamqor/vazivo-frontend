/**
 * Cookie configuration for session management.
 * Security options per Next.js and MDN recommendations.
 *
 * @module lib/auth/cookies
 */

export const SESSION_COOKIE_NAME = "session";

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },
} as const;

/** Cookie options type for use with Next.js cookies().set() */
export type SessionCookieSetOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
  expires?: Date;
};
