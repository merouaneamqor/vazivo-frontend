/**
 * SEO Configuration for Vazivo
 * Master keyword list and structured data helpers
 */

import { getBusinessCityDisplay } from "@/lib/utils";

export const SEO_KEYWORDS = {
  // Core platform keywords
  core: [
    "restaurant reservation",
    "book table online",
    "restaurant booking app",
    "dining reservation platform",
    "find restaurants",
    "reserve table",
    "restaurant discovery",
    "best restaurants near me",
    "table booking system",
    "restaurant scheduling",
  ],

  // Morocco cities
  cities: {
    casablanca: [
      "restaurant casablanca",
      "best restaurants casablanca",
      "book table casablanca",
      "moroccan cuisine casablanca",
      "dining casablanca",
    ],
    rabat: [
      "restaurant rabat",
      "best restaurants rabat",
      "book table rabat",
      "dining rabat",
    ],
    marrakech: [
      "restaurant marrakech",
      "best restaurants marrakech",
      "book table marrakech",
      "dining marrakech",
    ],
    tanger: [
      "restaurant tanger",
      "best restaurants tanger",
      "book table tanger",
    ],
    agadir: [
      "restaurant agadir",
      "best restaurants agadir",
      "book table agadir",
    ],
    fes: [
      "restaurant fes",
      "best restaurants fes",
      "book table fes",
    ],
    meknes: ["restaurant meknes", "dining meknes"],
    tetouan: ["restaurant tetouan", "dining tetouan"],
    essaouira: ["restaurant essaouira", "dining essaouira"],
    mohammedia: ["restaurant mohammedia"],
    temara: ["restaurant temara"],
    nador: ["restaurant nador"],
    harhoura: ["restaurant harhoura"],
  },

  // Cuisine-based keywords
  services: {
    moroccan: [
      "moroccan restaurant",
      "traditional moroccan cuisine",
      "tajine restaurant",
      "couscous booking",
    ],
    mediterranean: [
      "mediterranean restaurant",
      "mediterranean cuisine",
      "book mediterranean",
    ],
    international: ["international restaurant", "fusion dining"],
    french: ["french restaurant", "french cuisine"],
    seafood: ["seafood restaurant", "fish restaurant"],
  },

  longTail: [
    "book a table near me now",
    "last minute restaurant reservation",
    "best restaurant reviews morocco",
    "romantic dinner reservation",
    "family dinner booking",
  ],

  business: [
    "restaurant reservation system",
    "table management",
    "restaurant booking software",
    "dining reservation platform",
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
    "@type": "Restaurant",
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
        name: "Dining experiences",
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vazivo.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vazivo",
    alternateName: "Vazivo Morocco",
    url: appUrl,
    logo: `${appUrl}/logo.svg`,
    description: "Discover and book the best restaurants. Find and reserve tables at the best restaurants near you with Vazivo.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MA",
    },
    sameAs: [],
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vazivo.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vazivo",
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
