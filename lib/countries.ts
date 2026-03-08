/** Country name and ISO 3166-1 alpha-2 code for Nominatim countrycodes filter */
export const COUNTRIES: { name: string; code: string }[] = [
  { name: "Morocco", code: "ma" },
  { name: "France", code: "fr" },
  { name: "Spain", code: "es" },
  { name: "Belgium", code: "be" },
  { name: "Canada", code: "ca" },
  { name: "United States", code: "us" },
  { name: "United Kingdom", code: "gb" },
  { name: "Germany", code: "de" },
  { name: "Italy", code: "it" },
  { name: "Netherlands", code: "nl" },
  { name: "Portugal", code: "pt" },
  { name: "Switzerland", code: "ch" },
  { name: "Algeria", code: "dz" },
  { name: "Tunisia", code: "tn" },
  { name: "Egypt", code: "eg" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "United Arab Emirates", code: "ae" },
  { name: "Turkey", code: "tr" },
  { name: "Other", code: "" },
];

export const DEFAULT_COUNTRY = "Morocco";

export function getCountryCode(name: string): string | undefined {
  return COUNTRIES.find((c) => c.name === name)?.code;
}
