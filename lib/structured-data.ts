/**
 * Structured Data (Schema.org) utilities for SEO
 * Helps search engines understand your content better
 */

import { categoryNameToSlug, cityNameToSlug } from "./utils";

export interface BusinessSchemaData {
  name: string;
  description: string;
  image: string;
  url: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    postalCode?: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
  priceRange?: string;
  openingHours?: string[];
}

/**
 * Generate Organization Schema (for homepage)
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vazivo",
    description:
      "Discover and connect with beauty salons, wellness centers, and professional services in your area",
    url: "https://vazivo.com",
    logo: "https://vazivo.com/logo.png",
    sameAs: [
      "https://facebook.com/vazivo",
      "https://instagram.com/vazivo",
      "https://twitter.com/vazivo",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-XXX-XXX-XXXX",
      contactType: "Customer Service",
    },
    areaServed: {
      "@type": "Country",
      name: "MA",
    },
  };
};

/**
 * Generate LocalBusiness Schema (for business pages)
 */
export const generateLocalBusinessSchema = (data: BusinessSchemaData) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.name,
    description: data.description,
    image: data.image,
    url: data.url,
    ...(data.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: data.address.streetAddress || "",
        addressLocality: data.address.addressLocality,
        postalCode: data.address.postalCode || "",
        addressCountry: data.address.addressCountry,
      },
    }),
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    ...(data.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.rating.ratingValue,
        reviewCount: data.rating.reviewCount,
      },
    }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    ...(data.openingHours && {
      openingHoursSpecification: data.openingHours.map((hours) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: hours,
      })),
    }),
  };
};

/**
 * Generate SearchAction Schema (for sitelinks search box in SERP)
 */
export const generateSearchActionSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://vazivo.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://vazivo.com/search?q={search_term_string}",
      },
      query_input: "required name=search_term_string",
    },
  };
};

/**
 * Generate BreadcrumbList Schema
 */
export const generateBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate AggregateOffer Schema (for category pages with multiple businesses)
 */
export const generateAggregateOfferSchema = (
  categoryName: string,
  businessCount: number,
  cityName: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} in ${cityName}`,
    description: `Browse ${businessCount} ${categoryName} businesses in ${cityName}`,
    url: `https://vazivo.com/${categoryNameToSlug(categoryName)}/${cityNameToSlug(cityName)}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: businessCount,
    },
  };
};
