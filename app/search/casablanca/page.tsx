import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.cities.casablanca");
  
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "restaurants Casablanca",
      "réservation restaurant Casablanca",
      "meilleurs restaurants Casablanca",
      "book table Casablanca",
      "dining Casablanca",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

export default function Page() {
  return null; // This will be handled by dynamic routing
}
