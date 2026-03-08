import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.cities.casablanca");
  
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "salon casablanca",
      "coiffeur casablanca",
      "barber casablanca",
      "spa casablanca",
      "hammam casablanca",
      "beauty salon casablanca",
      "best barbershop casablanca",
      "réservation salon casablanca",
      "booking salon casablanca",
      "manucure casablanca",
      "massage casablanca",
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
