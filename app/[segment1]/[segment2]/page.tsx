import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import SearchPageContent from "@/app/search/SearchPageContent";
import { getCategoryMeta, unslugify } from "@/lib/seo-meta";
import { getSeoOverride } from "@/lib/seo-overrides";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/+$/, "");

/**
 * Doctolib-style SEO listing: /[category]/[city] (e.g. /coiffeur/casablanca)
 * Uses [segment1]/[segment2] to avoid conflict with [city]/[category]/[slug] (same path depth, different param names).
 * Here: segment1 = category, segment2 = city.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment1: string; segment2: string }>;
}): Promise<Metadata> {
  const { segment1: category, segment2: city } = await params;
  const cityName = unslugify(city);
  const baseMeta = getCategoryMeta(category, cityName);
  const override = await getSeoOverride(`${category}/${city}`);
  const meta = {
    title: override?.title || baseMeta.title,
    description: override?.meta_description || baseMeta.description,
  };
  const canonicalUrl = `${appUrl}/${category}/${city}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: `${unslugify(category)} in ${cityName}, ${unslugify(category)} services ${cityName}, best ${unslugify(category)} near me`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "fr-MA": `${canonicalUrl}?hl=fr`,
        "ar-MA": `${canonicalUrl}?hl=ar`,
        en: `${canonicalUrl}?hl=en`,
        "x-default": canonicalUrl,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: "website",
      siteName: "OllaZen",
      locale: "fr_MA",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function CategoryCityListingPage({
  params,
}: {
  params: Promise<{ segment1: string; segment2: string }>;
}) {
  const { segment1: category, segment2: city } = await params;
  const cityName = unslugify(city);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${unslugify(category)} à ${cityName}`,
    description: `Trouvez et réservez les meilleurs ${unslugify(category).toLowerCase()} à ${cityName} sur OllaZen`,
    url: `${appUrl}/${category}/${city}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<PageSpinner />}>
        <SearchPageContent />
      </Suspense>
    </>
  );
}
