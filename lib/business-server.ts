import { cache } from "react";
import { cityNameToSlug, getSearchPath, getBusinessCityDisplay, getBusinessCategoryDisplay } from "@/lib/utils";
import type { Business, OpeningHours, Service } from "@/types";

/** API base URL for server-side fetch (e.g. business by slug). Prefer API_URL so server can reach backend. */
export function getApiBaseUrl(): string {
  const base =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1";
  return base.replace(/\/+$/, "");
}

/** Normalize slug: lowercase, hyphenated. Used for canonical URL and redirect. */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Slug fallback: if "name-city" style slug 404s, try "name" (matches backend find_business!).
 * e.g. nail-salon-rabat-rabat -> nail-salon-rabat
 */
function slugFallback(slug: string): string | null {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("-")) return null;
  const withoutLastSegment = trimmed.replace(/-[a-z0-9-]+$/, "");
  return withoutLastSegment && withoutLastSegment !== trimmed ? withoutLastSegment : null;
}

/**
 * Fetch a business by slug from the API.
 * - Returns `null` when the business genuinely doesn't exist (404).
 * - Throws for non-404 API errors so the caller can show an error page rather than a false 404.
 * - Wrapped in `React.cache` so `generateMetadata` and the page component share one fetch
 *   per request (avoids the 200→404 race when `cache: 'no-store'` is set in dev).
 */
export const fetchBusinessBySlug = cache(async (slug: string): Promise<Business | null> => {
  const trimmed = slug.trim();
  const encoded = encodeURIComponent(trimmed);
  const url = `${getApiBaseUrl()}/public/businesses/${encoded}`;
  const fetchOpts: RequestInit = {
    headers: { "Content-Type": "application/json" },
    // In dev disable Next's fetch cache; in prod revalidate every 60 s
    ...(process.env.NODE_ENV === "development"
      ? { cache: "no-store" as RequestCache }
      : { next: { revalidate: 60 } }),
  };

  try {
    let res = await fetch(url, fetchOpts);

    if (!res.ok) {
      // Try fallback slug (e.g. "name-city-city" → "name-city")
      if (res.status === 404) {
        const fallback = slugFallback(slug);
        if (fallback) {
          const fallbackUrl = `${getApiBaseUrl()}/public/businesses/${encodeURIComponent(fallback)}`;
          res = await fetch(fallbackUrl, fetchOpts);
        }
      }
    }

    // Genuine "not found" — return null so the page can call notFound()
    if (res.status === 404) return null;

    // Any other non-OK response is an API/server error — throw so the error boundary fires
    if (!res.ok) {
      throw new Error(`API error ${res.status} fetching business "${slug}"`);
    }

    const data = (await res.json()) as { business?: Business };
    return data.business ?? null;
  } catch (err) {
    // Re-throw genuine errors (not network failures in dev)
    if (err instanceof Error && err.message.startsWith("API error")) throw err;
    if (process.env.NODE_ENV === "development") {
      console.warn("[fetchBusinessBySlug] fetch failed:", (err as Error)?.message ?? err);
    }
    return null;
  }
});

export function buildMetaDescription(business: Business): string {
  const maxLen = 160;
  const city = getBusinessCityDisplay(business.city) || "your area";
  const desc = (business.description || "").trim();
  const part1 = desc ? `${desc.slice(0, 120).trim()}${desc.length > 120 ? "…" : ""}` : business.name;
  const servicesHint =
    business.services?.length && business.services.length > 0
      ? ` Services from ${business.services[0].formatted_price || ""}.`
      : "";
  const tail = ` in ${city}.${servicesHint} Book on OllaZen.`;
  const candidate = `${part1}${tail}`;
  return candidate.length > maxLen ? candidate.slice(0, maxLen - 3) + "…" : candidate;
}

const DAY_TO_SCHEMA: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/** Intervals for one day: legacy { open, close } or array of { open, close }. */
function getIntervalsForDay(
  hours: { open?: string | null; close?: string | null } | Array<{ open?: string | null; close?: string | null }> | null
): Array<{ open: string; close: string }> {
  if (!hours) return [];
  if (Array.isArray(hours)) {
    return hours
      .filter((h) => h && (h.open != null && h.close != null))
      .map((h) => ({ open: String(h!.open).trim(), close: String(h!.close).trim() }))
      .filter((int) => int.open && int.close);
  }
  const open = hours.open != null ? String(hours.open).trim() : "";
  const close = hours.close != null ? String(hours.close).trim() : "";
  return open && close ? [{ open, close }] : [];
}

function buildOpeningHoursSpecification(opening_hours: OpeningHours | Record<string, Array<{ open: string; close: string }>>): Array<{
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string;
  opens: string;
  closes: string;
}> {
  const out: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string;
    opens: string;
    closes: string;
  }> = [];
  for (const [day, hours] of Object.entries(opening_hours || {})) {
    const dayOfWeek = DAY_TO_SCHEMA[day.toLowerCase()];
    if (!dayOfWeek) continue;
    const intervals = getIntervalsForDay(hours as { open?: string | null; close?: string | null } | Array<{ open?: string | null; close?: string | null }>);
    for (const int of intervals) {
      out.push({ "@type": "OpeningHoursSpecification", dayOfWeek, opens: int.open, closes: int.close });
    }
  }
  return out;
}

function getLocalBusinessType(
  category: string
): "HairSalon" | "BeautySalon" | "Spa" | "HealthClub" | "LocalBusiness" {
  const c = (category || "").toLowerCase();
  if (c.includes("hammam") || c.includes("spa") || c.includes("massage") || c.includes("wellness") || c.includes("bien-etre") || c.includes("relaxation")) return "Spa";
  if (c.includes("hair") || c.includes("coiffeur") || c.includes("salon") || c === "barber" || c === "barbershop") return "HairSalon";
  if (c.includes("beauty") || c.includes("beaute") || c.includes("nail") || c.includes("esthetique") || c.includes("ongles")) return "BeautySalon";
  if (c.includes("fitness") || c.includes("gym") || c.includes("sport")) return "HealthClub";
  return "LocalBusiness";
}

export function buildLocalBusinessJsonLd(business: Business, appUrl: string, canonicalPath: string): object {
  const url = `${appUrl}${canonicalPath}`;
  const sameAs: string[] = [];
  if (business.website) sameAs.push(business.website);
  const imageUrls = (business.image_urls?.length ? business.image_urls : [business.logo_url].filter(Boolean)) as string[];
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": getLocalBusinessType(getBusinessCategoryDisplay(business.category)),
    name: business.name,
    description: business.description || undefined,
    image: imageUrls.length ? imageUrls : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: getBusinessCityDisplay(business.city),
      addressCountry: "MA",
    },
    telephone: business.phone || undefined,
    url,
    sameAs: sameAs.length ? sameAs : undefined,
    aggregateRating:
      Number(business.total_reviews) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(business.average_rating) || 0,
            reviewCount: Number(business.total_reviews) || 0,
          }
        : undefined,
  };
  if (business.lat != null && business.lng != null) {
    ld.geo = { "@type": "GeoCoordinates", latitude: business.lat, longitude: business.lng };
  }
  const hoursSpec = buildOpeningHoursSpecification(business.opening_hours || {});
  if (hoursSpec.length) ld.openingHoursSpecification = hoursSpec;
  return ld;
}

export function buildBreadcrumbListJsonLd(business: Business, appUrl: string, canonicalPath: string): object {
  const url = `${appUrl}${canonicalPath}`;
  const cityStr = getBusinessCityDisplay(business.city) || null;
  const categoryStr = getBusinessCategoryDisplay(business.category) || null;
  const citySlug = cityStr ? cityNameToSlug(cityStr) : null;
  const citySearchUrl = citySlug ? `${appUrl}/search/${citySlug}` : `${appUrl}/search`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${appUrl}/` },
      { "@type": "ListItem", position: 2, name: cityStr || "Search", item: citySearchUrl },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryStr ? `${categoryStr} à ${cityStr || ""}`.trim() : "Category",
        item: `${appUrl}${getSearchPath(cityStr, categoryStr)}`,
      },
      { "@type": "ListItem", position: 4, name: business.name, item: url },
    ],
  };
}

const OFFER_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "MAD";

export function buildOfferJsonLd(services: Service[], appUrl: string): object[] {
  return (services || []).map((s) => ({
    "@context": "https://schema.org",
    "@type": "Offer",
    name: s.name,
    price: s.price,
    priceCurrency: OFFER_CURRENCY,
    url: `${appUrl}/service/${s.id}`,
  }));
}
