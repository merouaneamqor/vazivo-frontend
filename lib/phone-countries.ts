/**
 * Country options for PhoneInput (dial codes, flags).
 * Separated from lib/countries to avoid circular/bundling issues.
 */
import { getCountryCallingCode, getSupportedRegions } from "@/lib/phone";

/** Region code to flag emoji (e.g. "MA" -> "🇲🇦") */
function regionToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))
    .join("");
}

export type CountryOption = {
  code: string;
  name: string;
  dial: string;
  flag: string;
};

/** Country options for PhoneInput (dial codes, flags). Morocco first. */
export function getCountryOptions(): CountryOption[] {
  const preferred = ["MA", "FR", "ES", "BE", "CA", "US", "GB", "DE", "IT", "NL", "PT", "CH", "DZ", "TN", "EG", "SA", "AE", "TR"];
  const preferredSet = new Set(preferred);
  const all = getSupportedRegions();
  const ordered = [...preferred, ...all.filter((r) => !preferredSet.has(r))];
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  return ordered.map((code) => ({
    code,
    name: displayNames.of(code) || code,
    dial: `+${getCountryCallingCode(code)}`,
    flag: regionToFlag(code),
  }));
}
