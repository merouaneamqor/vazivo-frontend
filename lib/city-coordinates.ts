/**
 * Default map coordinates for Moroccan cities (search map centers).
 * Keys: lowercase city name and slug for matching.
 */
const CITY_COORDS: Record<string, [number, number]> = {
  casablanca: [33.5731, -7.5898],
  rabat: [34.0209, -6.8416],
  marrakech: [31.6295, -7.9811],
  fes: [34.0331, -5.0003],
  tanger: [35.7595, -5.834],
  tangier: [35.7595, -5.834],
  agadir: [30.4278, -9.5981],
  meknes: [33.895, -5.5547],
  oujda: [34.6867, -1.9114],
  kenitra: [34.2611, -6.5802],
  tetouan: [35.5769, -5.3684],
  sale: [34.0389, -6.8166],
  temara: [33.9283, -6.9066],
  mohammedia: [33.6861, -7.3829],
  essaouira: [31.5085, -9.7595],
  nador: [35.1682, -2.9333],
  eljadida: [33.2542, -8.5062],
  "el-jadida": [33.2542, -8.5062],
  khouribga: [32.8847, -6.9066],
  benimellal: [32.3373, -6.3498],
};

/** Normalize city name/slug for lookup: lowercase, collapse spaces, strip accents, then non-alpha. */
function normalizeKey(nameOrSlug: string): string {
  let s = nameOrSlug.trim().toLowerCase().replace(/\s+/g, "-");
  // Normalize accents so "Fès" -> "fes" before stripping (else "fès" -> "fs" and we miss "fes")
  s = s
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[ùûü]/g, "u")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ç]/g, "c");
  return s.replace(/[^a-z0-9-]/g, "");
}

/**
 * Get [lat, lng] for a city by name or slug, or null if unknown.
 */
export function getCityCenter(cityNameOrSlug: string | null | undefined): [number, number] | null {
  if (!cityNameOrSlug?.trim()) return null;
  const key = normalizeKey(cityNameOrSlug);
  return CITY_COORDS[key] ?? null;
}
