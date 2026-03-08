/**
 * Nominatim (OpenStreetMap) geocoding API - free, no API key required.
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 * - Add User-Agent header
 * - Max 1 request per second (use debounce)
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "OllaZenApp/1.0 (contact@ollazen.ma)";

export interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    district?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

const CITY_TYPES = ["city", "town", "village", "municipality"];

export async function searchCities(
  query: string,
  limit = 10,
  countryCode?: string
): Promise<NominatimPlace[]> {
  if (!query || query.trim().length < 3) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    limit: String(Math.min(limit, 20)),
    addressdetails: "1",
  });
  if (countryCode) params.set("countrycodes", countryCode);
  const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimPlace[];
  return data.filter(
    (p) =>
      CITY_TYPES.includes(p.type || "") ||
      p.address?.city ||
      p.address?.town ||
      p.address?.village ||
      p.address?.municipality
  ).slice(0, limit);
}

export async function searchPlaces(query: string, limit = 10): Promise<NominatimPlace[]> {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    limit: String(limit),
    addressdetails: "1",
  });
  const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimPlace[];
  return data;
}

/** Search neighborhoods/suburbs within a city */
export async function searchNeighborhoods(
  query: string,
  city: string,
  limit = 10
): Promise<NominatimPlace[]> {
  if (!query || query.trim().length < 2 || !city?.trim()) return [];
  const fullQuery = `${query.trim()}, ${city.trim()}`;
  const params = new URLSearchParams({
    q: fullQuery,
    format: "json",
    limit: String(limit),
    addressdetails: "1",
  });
  const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimPlace[];
  return data;
}

/** Extract display label for a city result */
export function getCityDisplayName(place: NominatimPlace): string {
  const addr = place.address;
  const city = addr?.city || addr?.town || addr?.village || addr?.municipality || "";
  const country = addr?.country || "";
  if (city && country) return `${city}, ${country}`;
  return place.display_name;
}

/** Extract display label for a neighborhood result */
export function getNeighborhoodDisplayName(place: NominatimPlace): string {
  const addr = place.address;
  const name =
    addr?.neighbourhood ||
    addr?.suburb ||
    addr?.quarter ||
    addr?.district ||
    place.display_name.split(",")[0]?.trim() ||
    place.display_name;
  return name;
}
