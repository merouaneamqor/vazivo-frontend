"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/home-zen/HeroSection";
import { CategoriesSection } from "@/components/home-zen/CategoriesSection";
import { ProviderPlatformSection } from "@/components/home-zen/ProviderPlatformSection";
import { PopularCitiesSection } from "@/components/home-zen/PopularCitiesSection";
import { FeaturedBusinessesSection } from "@/components/home-zen/FeaturedBusinessesSection";
import { FaqSection } from "@/components/home-zen/FaqSection";
import { CtaSection } from "@/components/home-zen/CtaSection";

export default function HomePage() {
  const t = useTranslations("home");
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <ProviderPlatformSection />
      <PopularCitiesSection />
      <FeaturedBusinessesSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
