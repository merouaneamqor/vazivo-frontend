/**
 * Thin wrapper around google-libphonenumber for parse, format, validate, and E.164.
 * All parsing is safe (try/catch); invalid or partial input returns null / false.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const lib = require("google-libphonenumber");

const phoneUtil = lib.PhoneNumberUtil.getInstance();
const PNF = lib.PhoneNumberFormat;

export const DEFAULT_REGION = "MA";

type PhoneNumber = ReturnType<typeof phoneUtil.parse>;

/**
 * Get country calling code for a region (e.g. "MA" -> "212").
 */
export function getCountryCallingCode(region: string): string {
  try {
    return String(phoneUtil.getCountryCodeForRegion(region) ?? "");
  } catch {
    return "";
  }
}

/**
 * Get supported region codes (ISO 3166-1 alpha-2).
 */
export function getSupportedRegions(): string[] {
  try {
    return phoneUtil.getSupportedRegions() ?? [];
  } catch {
    return [];
  }
}

/**
 * Parse a raw string into a PhoneNumber instance. Returns null on invalid or partial input.
 */
export function parse(
  input: string,
  defaultRegion: string = DEFAULT_REGION
): PhoneNumber | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return phoneUtil.parse(trimmed, defaultRegion);
  } catch {
    return null;
  }
}

/**
 * Format a parsed number for display (international style, e.g. "+1 202 456 1414").
 * Returns the original input if parsing fails.
 */
export function formatForDisplay(
  input: string,
  defaultRegion: string = DEFAULT_REGION
): string {
  const parsed = parse(input, defaultRegion);
  if (!parsed) return input;
  try {
    return phoneUtil.format(parsed, PNF.INTERNATIONAL);
  } catch {
    return input;
  }
}

/**
 * Validate: returns true only if the number is valid for the library.
 */
export function validate(
  input: string,
  defaultRegion: string = DEFAULT_REGION
): boolean {
  const parsed = parse(input, defaultRegion);
  if (!parsed) return false;
  try {
    return phoneUtil.isValidNumber(parsed);
  } catch {
    return false;
  }
}

/**
 * Return E.164 string for API/submit (e.g. "+12024561414"), or null if invalid.
 */
export function toE164(
  input: string,
  defaultRegion: string = DEFAULT_REGION
): string | null {
  const parsed = parse(input, defaultRegion);
  if (!parsed) return null;
  try {
    if (!phoneUtil.isValidNumber(parsed)) return null;
    return phoneUtil.format(parsed, PNF.E164);
  } catch {
    return null;
  }
}
