import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import SearchPageContent from "./SearchPageContent";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Recherche | Coiffeur, Barber, Spa, Hammam & Beauté au Maroc | OllaZen",
  description:
    "Recherchez et réservez parmi des centaines de salons de coiffure, barber, spa, hammam et instituts de beauté au Maroc. Filtrez par ville, catégorie et disponibilité.",
  alternates: { canonical: `${appUrl}/search` },
  openGraph: {
    title: "Recherche | Coiffeur, Barber, Spa, Hammam & Beauté au Maroc | OllaZen",
    description:
      "Recherchez et réservez parmi des centaines de salons de coiffure, barber, spa, hammam et instituts de beauté au Maroc.",
    url: `${appUrl}/search`,
    siteName: "OllaZen",
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <SearchPageContent />
    </Suspense>
  );
}