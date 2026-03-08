import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import SearchPageContent from "../SearchPageContent";
import { getCityMeta, unslugify } from "@/lib/seo-meta";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/+$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const cityName = unslugify(city);
  const meta = getCityMeta(cityName);
  const canonicalUrl = `${appUrl}/search/${city}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: `${cityName} beauty salons, ${cityName} wellness, beauty services in ${cityName}, find salons ${cityName}`,
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
      siteName: "Vazivo",
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

export default function SearchCityPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Beauty Services and Salons",
    description: "Find beauty salons and wellness services in your city",
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
