import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Define display helpers first so they are always bound when the module loads (avoids Turbopack client chunk "is not a function").
export const getBusinessCityDisplay = (city: unknown): string => {
  if (typeof city === "string" && city) return city;
  if (city && typeof city === "object" && "name" in city && typeof (city as { name: unknown }).name === "string")
    return (city as { name: string }).name;
  return "";
};

export const getBusinessCategoryDisplay = (category: unknown): string => {
  if (typeof category === "string" && category) return category;
  if (
    category &&
    typeof category === "object" &&
    "name" in category &&
    typeof (category as { name: unknown }).name === "string"
  )
    return (category as { name: string }).name;
  return "";
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "MAD";
const DEFAULT_CURRENCY_LOCALE = process.env.NEXT_PUBLIC_CURRENCY_LOCALE || "fr-MA";

export function formatPrice(price: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(DEFAULT_CURRENCY_LOCALE, {
    style: "currency",
    currency,
  }).format(price);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function formatDate(date: string | Date, format: "full" | "short" | "time" = "full"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  switch (format) {
    case "full":
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "short":
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "time":
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    default:
      return d.toLocaleDateString();
  }
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** URL slug from service name (fallback when API does not return slug). Normalizes accents and spaces. */
export function toServiceSlug(name: string | undefined): string {
  if (!name) return "";
  const normalized = name.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return normalized
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/** Slug for URL (e.g. "Agadir" → "agadir", "Hair & Beauty" → "hair-beauty"). Matches backend parameterize. Safe for any value; non-strings are treated as empty. */
function slugify(name: unknown): string {
  if (name === null || name === undefined) return "";
  if (typeof name !== "string") return "";
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || ""
  );
}

/** Slug for city in URL. Alias for slugify for clarity. Safe for any value. */
export function cityNameToSlug(name: unknown): string {
  return slugify(name);
}

/** Slug for category in URL (e.g. "Hair Salon" → "hair-salon"). Safe for any value. */
export function categoryNameToSlug(name: unknown): string {
  return slugify(name);
}

/**
 * Doctolib-style SEO paths:
 * - Both city + category → /category/city (e.g. /coiffeur/casablanca)
 * - City only → /search/city
 * - Category only → /search/all/category
 * - Neither → /search
 */
export function getSearchPath(city?: string | null, category?: string | null): string {
  const catStr = typeof category === "string" && category ? category : null;
  const cityStr = typeof city === "string" && city ? city : null;
  if (catStr) {
    const catSlug = categoryNameToSlug(catStr);
    if (cityStr) return `/${catSlug}/${cityNameToSlug(cityStr)}`;
    return `/search/all/${catSlug}`;
  }
  if (cityStr) return `/search/${cityNameToSlug(cityStr)}`;
  return "/search";
}

/** Business page path: /{citySlug}/{categorySlug}/{businessSlug} (e.g. /agadir/fitness/my-barber). Missing city/category use "all". */
export function getBusinessPath(business: {
  city?: string | null;
  category?: string | null;
  slug: string;
}): string {
  const cityStr = getBusinessCityDisplay(business.city);
  const categoryStr = getBusinessCategoryDisplay(business.category);
  const citySlug = cityStr ? cityNameToSlug(cityStr) : "all";
  const categorySlug = categoryStr ? categoryNameToSlug(categoryStr) : "all";
  const slugStr = typeof business.slug === "string" ? business.slug : "";
  return `/${citySlug}/${categorySlug}/${slugStr || "all"}`;
}
