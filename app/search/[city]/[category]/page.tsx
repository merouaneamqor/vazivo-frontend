import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import SearchPageContent from "../../SearchPageContent";
import { getCategoryMeta, getCategoryOnlyMeta, unslugify } from "@/lib/seo-meta";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/+$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city, category } = await params;
  const isAllCities = city === "all";
  const cityName = unslugify(city);
  const categoryName = unslugify(category);
  const meta = isAllCities
    ? getCategoryOnlyMeta(category)
    : getCategoryMeta(category, cityName);

  const canonicalUrl = `${appUrl}/search/${city}/${category}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: isAllCities
      ? `${categoryName} services, find ${categoryName}, ${categoryName} providers`
      : `${categoryName} in ${cityName}, ${categoryName} services ${cityName}, best ${categoryName} near me`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: "website",
      siteName: "OllaZen",
      locale: "en_US",
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

export default function SearchCityCategoryPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Service Directory",
    description: "Browse professionals and service providers",
    url: `${appUrl}/search`,
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
