/**
 * SEO Meta Templates
 *
 * Category-specific meta title/description templates for search pages.
 * Templates use {city} as a placeholder for the city name.
 * Primary language: French (target market: Morocco).
 */

interface CategoryMeta {
  title: string;
  description: string;
}

/** Convert a URL slug back to a display name (e.g. "casablanca" → "Casablanca", "el-jadida" → "El Jadida"). */
export function unslugify(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Category meta templates indexed by slug.
 * {city} is replaced dynamically with the resolved city name.
 */
const CATEGORY_META: Record<string, CategoryMeta> = {
  moroccan: {
    title: "Meilleurs restaurants marocains à {city} | Réservation | Vazivo",
    description:
      "Trouvez les meilleurs restaurants de cuisine marocaine à {city}. Réservez votre table en ligne en quelques clics sur Vazivo.",
  },
  mediterranean: {
    title: "Restaurants méditerranéens à {city} | Réservation | Vazivo",
    description:
      "Réservez une table dans les meilleurs restaurants méditerranéens à {city}. Découvrez et réservez sur Vazivo.",
  },
  italian: {
    title: "Restaurants italiens à {city} | Réservation | Vazivo",
    description:
      "Trouvez et réservez les meilleurs restaurants italiens à {city}. Pâtes, pizzas et plus. Réservez en ligne sur Vazivo.",
  },
  french: {
    title: "Restaurants français à {city} | Réservation | Vazivo",
    description:
      "Réservez une table dans un restaurant français à {city}. Cuisine raffinée et ambiance. Vazivo.",
  },
  japanese: {
    title: "Restaurants japonais à {city} | Réservation | Vazivo",
    description:
      "Sushi, ramen et cuisine japonaise à {city}. Réservez votre table en ligne sur Vazivo.",
  },
  seafood: {
    title: "Restaurants fruits de mer à {city} | Réservation | Vazivo",
    description:
      "Les meilleurs restaurants de poissons et fruits de mer à {city}. Réservez sur Vazivo.",
  },
  "street-food": {
    title: "Street food à {city} | Réservation | Vazivo",
    description:
      "Découvrez la street food à {city}. Réservez ou trouvez les meilleures adresses sur Vazivo.",
  },
};

/**
 * Build meta title and description for a category + city search page.
 * Falls back to a generic template when the category slug is not in the map.
 */
export function getCategoryMeta(categorySlug: string, cityName: string): CategoryMeta {
  const template = CATEGORY_META[categorySlug];

  if (template) {
    return {
      title: template.title.replace(/\{city\}/g, cityName),
      description: template.description.replace(/\{city\}/g, cityName),
    };
  }

  // Generic fallback
  const categoryName = unslugify(categorySlug);
  return {
    title: `${categoryName} à ${cityName} | Réservation en ligne | Vazivo`,
    description: `Trouvez les meilleurs restaurants ${categoryName} à ${cityName}. Comparez les avis, consultez les disponibilités et réservez votre table en ligne sur Vazivo.`,
  };
}

/**
 * Build meta title and description for a city-only search page (no category).
 */
export function getCityMeta(cityName: string): CategoryMeta {
  return {
    title: `Restaurants à ${cityName} | Réservation en ligne | Vazivo`,
    description: `Trouvez et réservez les meilleurs restaurants à ${cityName}. Réservez votre table en ligne facilement sur Vazivo.`,
  };
}

/**
 * Build meta for a category-only page (no city, e.g. /search/all/barber).
 */
export function getCategoryOnlyMeta(categorySlug: string): CategoryMeta {
  const template = CATEGORY_META[categorySlug];

  if (template) {
    return {
      title: template.title.replace(/\s*à \{city\}/g, " au Maroc"),
      description: template.description.replace(/\s*à \{city\}/g, " au Maroc"),
    };
  }

  const categoryName = unslugify(categorySlug);
  return {
    title: `${categoryName} au Maroc | Réservation en ligne | Vazivo`,
    description: `Trouvez les meilleurs restaurants ${categoryName} au Maroc. Comparez les avis et réservez votre table en ligne sur Vazivo.`,
  };
}
