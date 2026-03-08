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
  barber: {
    title: 'Meilleur Barber à {city} | Coupe Homme & Barbe | OllaZen',
    description:
      'Trouvez le meilleur barber à {city} pour une coupe homme moderne, une barbe taillée au cordeau ou un rasage traditionnel. Réservez votre place en ligne en quelques clics. Évitez les attentes\u00A0!',
  },
  coiffeur: {
    title: 'Coiffeur à {city} | Coloration, Coupe & Brushing | OllaZen',
    description:
      'Recherchez un coiffeur talentueux à {city}\u00A0? Pour une nouvelle coupe, une coloration expert ou un brushing parfait, réservez votre rendez-vous en ligne facilement. OllaZen vous connecte aux meilleurs salons.',
  },
  massage: {
    title: 'Massage à {city} | Soins Bien-être & Relaxation | OllaZen',
    description:
      "Besoin de vous détendre ? Réservez votre séance de massage à {city} : massage relaxant, deep tissue, californien et plus. Trouvez et réservez en ligne sur OllaZen.",
  },
  spa: {
    title: 'Spa à {city} | Massage, Détente & Bien-être | OllaZen',
    description:
      "Besoin de vous détendre\u00A0? Réservez votre séance dans un spa de luxe à {city}. Massages relaxants, soins corps et programmes bien-être. Trouvez et bookez l'établissement parfait sur OllaZen.",
  },
  hammam: {
    title: 'Hammam à {city} | Hammam Traditionnel & Soins Gommage | OllaZen',
    description:
      "Vivez l'expérience authentique du hammam marocain à {city}. Réservez en ligne pour un gommage, un soin au rhassoul et une détente pure. Comparez les établissements et trouvez les meilleures offres.",
  },
  salon: {
    title: 'Coiffeur à {city} | Coloration, Coupe & Brushing | OllaZen',
    description:
      'Recherchez un coiffeur talentueux à {city}\u00A0? Pour une nouvelle coupe, une coloration expert ou un brushing parfait, réservez votre rendez-vous en ligne facilement. OllaZen vous connecte aux meilleurs salons.',
  },
  fitness: {
    title: 'Fitness à {city} | Salle de Sport & Coach | OllaZen',
    description:
      'Trouvez les meilleures salles de fitness à {city}. Musculation, cours collectifs, coaching personnel. Réservez votre séance en ligne et atteignez vos objectifs.',
  },
  "salon-de-beaute": {
    title: 'Salon de Beauté à {city} | Soins Visage, Épil & Maquillage | OllaZen',
    description:
      'Votre beauté mérite le meilleur. Réservez en ligne dans les meilleurs salons de beauté à {city} pour soins visage, épilation, manucure et maquillage professionnel. Prenez rendez-vous 24h/24.',
  },
  "beauty-wellness": {
    title: 'Salon de Beauté à {city} | Soins Visage, Épil & Maquillage | OllaZen',
    description:
      'Votre beauté mérite le meilleur. Réservez en ligne dans les meilleurs salons de beauté à {city} pour soins visage, épilation, manucure et maquillage professionnel. Prenez rendez-vous 24h/24.',
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
    title: `${categoryName} à ${cityName} | Réservation en Ligne | OllaZen`,
    description: `Trouvez les meilleurs établissements ${categoryName} à ${cityName}. Comparez les avis, consultez les disponibilités et réservez en ligne en quelques clics sur OllaZen.`,
  };
}

/**
 * Build meta title and description for a city-only search page (no category).
 */
export function getCityMeta(cityName: string): CategoryMeta {
  return {
    title: `Salons & Bien-être à ${cityName} | Réservation en Ligne | OllaZen`,
    description: `Trouvez et réservez les meilleurs salons de coiffure, barber, spa, hammam et instituts de beauté à ${cityName}. Réservez en ligne facilement sur OllaZen.`,
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
    title: `${categoryName} au Maroc | Réservation en Ligne | OllaZen`,
    description: `Trouvez les meilleurs établissements ${categoryName} au Maroc. Comparez les avis, consultez les disponibilités et réservez en ligne en quelques clics sur OllaZen.`,
  };
}
