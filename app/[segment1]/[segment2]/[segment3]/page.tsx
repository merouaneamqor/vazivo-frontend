import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BusinessPageClient } from "@/app/business/[slug]/BusinessPageClient";
import { cloudinaryOgUrl } from "@/lib/cloudinary-og";
import {
  fetchBusinessBySlug,
  normalizeSlug,
  buildLocalBusinessJsonLd,
  buildBreadcrumbListJsonLd,
  buildOfferJsonLd,
} from "@/lib/business-server";
import {
  getBusinessPath,
  cityNameToSlug,
  categoryNameToSlug,
  getBusinessCityDisplay,
  getBusinessCategoryDisplay,
} from "@/lib/utils";

/**
 * Business page: /[city]/[category]/[slug] (e.g. /tanger/hammam/hammam-zaryouh)
 * Canonical URL: /{city}/{category}/{slug}
 * Title format: "{name} {city} – Prix, Photos et Avis | Vazivo"
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment1: string; segment2: string; segment3: string }>;
}): Promise<Metadata> {
  const { segment3: slug } = await params;
  const business = await fetchBusinessBySlug(slug);
  if (!business) return { title: "Business Not Found" };

  const canonicalPath = getBusinessPath(business);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const canonicalUrl = `${appUrl}${canonicalPath}`;
  const city = getBusinessCityDisplay(business.city) || "";
  const categoryRaw = getBusinessCategoryDisplay(business.category) || "";

  // "{name} {city} – Prix, Photos et Avis | Vazivo"
  const title = city
    ? `${business.name} ${city} – Prix, Photos et Avis`
    : `${business.name} – Prix, Photos et Avis`;

  // Description ≤ 160 chars
  const rawDesc = `Découvrez ${business.name} à ${city} : prix, photos, avis clients et services proposés. Réservez votre séance sur Vazivo.`;
  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;

  // Keywords: name+city, category+city, name alone
  const keywords = [
    `${business.name.toLowerCase()} ${city.toLowerCase()}`,
    city ? `${categoryRaw.toLowerCase()} ${city.toLowerCase()}` : categoryRaw.toLowerCase(),
    business.name.toLowerCase(),
  ].filter(Boolean);

  const mainPhoto = business.image_urls?.[0] || business.logo_url || undefined;
  const ogImage = cloudinaryOgUrl(mainPhoto);
  const ogTitle = city
    ? `${business.name} ${city} – Photos & Avis`
    : `${business.name} – Photos & Avis`;

  return {
    title,
    description,
    keywords,
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
      title: ogTitle,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Vazivo",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${business.name} ${city}`.trim() }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ segment1: string; segment2: string; segment3: string }>;
}) {
  const { segment1: cityParam, segment2: categoryParam, segment3: slug } = await params;
  const business = await fetchBusinessBySlug(slug);
  if (!business) return notFound();

  const canonicalPath = getBusinessPath(business);
  const cityStr = getBusinessCityDisplay(business.city);
  const categoryStr = getBusinessCategoryDisplay(business.category);
  const expectedCitySlug = cityStr ? cityNameToSlug(cityStr) : "all";
  const expectedCategorySlug = categoryStr ? categoryNameToSlug(categoryStr) : "all";
  normalizeSlug(slug); // ensure slug is valid form

  const pathMismatch =
    cityParam !== expectedCitySlug ||
    categoryParam !== expectedCategorySlug ||
    slug !== business.slug;

  if (pathMismatch) {
    redirect(canonicalPath);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const localBusinessLd = buildLocalBusinessJsonLd(business, appUrl, canonicalPath);
  const breadcrumbLd = buildBreadcrumbListJsonLd(business, appUrl, canonicalPath);
  const offerLd = buildOfferJsonLd(business.services || [], appUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {offerLd.length > 0 &&
        offerLd.map((offer, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(offer) }}
          />
        ))}
      <BusinessPageClient slug={business.slug} initialData={business} />
    </>
  );
}
