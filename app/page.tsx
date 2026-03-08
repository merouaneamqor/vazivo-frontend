"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { VazivoHero } from "@/components/vazivo";
import { TrendingRestaurantsSection } from "@/components/vazivo";
import { VazivoCtaSection } from "@/components/vazivo";
import { FaqSection } from "@/components/home-zen/FaqSection";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="min-h-screen">
      <VazivoHero />
      <TrendingRestaurantsSection />
      <FaqSection />
      <VazivoCtaSection />
    </div>
  );
}
