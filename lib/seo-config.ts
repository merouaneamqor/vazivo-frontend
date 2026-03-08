/**
 * SEO Configuration for Ollazen
 * Master keyword list and structured data helpers
 */

import { getBusinessCityDisplay } from "@/lib/utils";

export const SEO_KEYWORDS = {
  // Core platform keywords
  core: [
    "online booking platform",
    "salon booking app",
    "beauty booking platform",
    "barber appointment booking",
    "book salon online",
    "wellness booking app",
    "spa booking system",
    "hairdresser booking online",
    "beauty services marketplace",
    "salon scheduling software",
  ],

  // Morocco cities
  cities: {
    casablanca: [
      "salon casablanca",
      "beauty salon casablanca",
      "barber casablanca",
      "hammam casablanca",
      "spa casablanca",
      "coiffeur casablanca",
      "best barbershop casablanca",
      "beauty salon near me casablanca",
      "the 99 barbershop casablanca",
    ],
    rabat: [
      "salon rabat",
      "coiffeur rabat",
      "barber rabat",
      "spa rabat",
      "hammam spa hay riad rabat",
      "men's club by zakibarber rabat",
      "so spa rabat",
      "olm beauty rabat",
      "hammam tkatek rabat",
      "hammam guich oudaya",
    ],
    marrakech: [
      "salon marrakech",
      "barber marrakech",
      "spa marrakech",
      "booking masseuse marrakech",
      "french vibe marrakech",
      "salon kayn marrakech",
      "hammam marrakech les bains",
    ],
    tanger: [
      "salon tanger",
      "coiffeur tanger",
      "barber tanger",
      "hammam boughaz tanger",
      "lahlou hammam tanger",
      "bangkok spa beauty and massage center",
      "vip home tanger",
      "glamour spa tanger",
      "sena spa tanger",
    ],
    agadir: [
      "salon agadir",
      "spa agadir",
      "hammam charaf agadir",
    ],
    fes: [
      "coiffeur fes",
      "arum salon fes",
      "galaxy spa fes",
      "infinity fes",
      "ton fes",
    ],
    meknes: [
      "lotus spa meknes",
      "jean louis david meknes",
    ],
    tetouan: [
      "beauty center ismael hair spa tétouan",
      "zenobia spa tetouan",
    ],
    essaouira: [
      "salon de beauté essaouira",
      "spa essaouira",
      "centre esthétique essaouira",
    ],
    mohammedia: [
      "turkish hammam al falah mohammedia",
      "hammam mohammedia",
      "hammam falah mohammedia",
      "coin chic mohammedia",
    ],
    temara: [
      "salon khair temara",
      "instant de plaisir spa témara",
      "onglerie temara",
    ],
    nador: [
      "coiffeur nador",
      "spa nador",
      "wellness nador",
    ],
    harhoura: [
      "beauty lounge harhoura",
    ],
  },

  // Service-based keywords
  services: {
    hair: [
      "haircut booking",
      "hairdresser near me",
      "hair coloring appointment",
      "balayage casablanca",
      "barber beard trim",
      "men's haircut online booking",
      "coiffeur paris",
    ],
    beauty: [
      "manicure booking",
      "gel nails booking",
      "pedicure booking",
      "nail salon casablanca",
      "brow shaping booking",
      "lash extensions booking",
      "salon biana beauty",
      "beauty place secret tanger",
      "joudy beauty",
    ],
    wellness: [
      "massage booking",
      "spa appointment",
      "facial treatment booking",
      "hammam reservation",
      "wellness services morocco",
      "hammam charaf",
      "hammam boughaz",
      "les bains almaha spa",
      "hammam zaryouh",
      "leelah spa hamman",
      "maison georgina",
      "maison eve spa",
      "sublime d'orient",
      "kenso spa",
      "so spa prestigia",
      "spa prestigia",
      "imane spa",
      "hammam turc al falah",
      "hammam lilya",
      "hammam lalla khadija",
      "hammam targa",
      "le rivage clèopâtre",
      "hammam tarik",
      "hammam al madina",
      "hammam el fen",
      "coin zen et belle",
    ],
    fitness: [
      "personal trainer booking",
      "gym class booking",
      "yoga class morocco",
      "fitness coach appointment",
    ],
    medical: [
      "laser hair removal booking",
      "skincare clinic booking",
      "cosmetic treatment appointment",
    ],
  },

  // Long-tail conversion keywords
  longTail: [
    "book a haircut near me now",
    "last-minute salon booking",
    "affordable barber near me",
    "best salon reviews morocco",
    "beauty deals casablanca",
    "same day manicure booking",
    "cheap massage casablanca",
    "professional hairdresser booking",
  ],

  // Provider/business keywords
  business: [
    "salon software",
    "salon CRM",
    "barbershop management system",
    "booking software for salons",
    "appointment system for barbers",
    "beauty business platform",
    "salon online calendar",
    "scheduling app for salons",
  ],
};

/**
 * Generate structured data for local business
 */
export function generateLocalBusinessSchema(business: {
  name: string;
  description: string;
  address: string;
  city: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  priceRange?: string;
  services?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: business.name,
    description: business.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: getBusinessCityDisplay(business.city),
      addressCountry: "MA",
    },
    ...(business.phone && { telephone: business.phone }),
    ...(business.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: business.rating,
        reviewCount: business.reviewCount || 0,
      },
    }),
    ...(business.image && { image: business.image }),
    ...(business.priceRange && { priceRange: business.priceRange }),
    ...(business.services && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: business.services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service,
          },
        })),
      },
    }),
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ollazen.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ollazen",
    alternateName: "Ollazen Morocco",
    url: appUrl,
    logo: `${appUrl}/logo.svg`,
    description: "Plateforme de réservation en ligne pour salons de coiffure, barbershops, spas, hammams et instituts de beauté au Maroc",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MA",
    },
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["French", "Arabic", "English"],
    },
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebsiteSchema() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ollazen.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ollazen",
    url: appUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${appUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
