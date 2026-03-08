"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

const HeroSearchBar = dynamic(() => import("@/components/HeroSearchBar"), {
  ssr: true,
  loading: () => (
    <div className="w-full max-w-3xl lg:max-w-4xl h-14 rounded-2xl bg-white/80 border border-neutral-200 animate-pulse" aria-hidden />
  ),
});

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative z-10 min-h-[28rem] sm:min-h-[32rem] bg-gradient-to-br from-primary-50 via-accent-50 to-lavender-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 via-accent-100/20 to-lavender-100/30" />
        <div className="hidden md:block absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-primary-300/20 rounded-full pointer-events-none" style={{ filter: "blur(80px)" }} />
        <div className="hidden md:block absolute bottom-[15%] left-[5%] w-[350px] h-[350px] bg-accent-300/15 rounded-full pointer-events-none" style={{ filter: "blur(90px)" }} />
        <div className="hidden lg:block absolute top-[50%] left-[15%] w-[250px] h-[250px] bg-lavender-300/18 rounded-full pointer-events-none" style={{ filter: "blur(70px)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 backdrop-blur-sm text-xs sm:text-sm font-medium text-primary-600 border border-primary-200 mb-4 sm:mb-5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t("heroBadge")}
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-neutral-900 mb-3 sm:mb-4 md:mb-6 px-2">
            {t("heroHeadlineBefore")}
            <span className="text-primary-500">
              {t("heroHeadlineWellness")}
            </span>
            {t("heroHeadlineAfter")}
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-700 mb-6 sm:mb-8 md:mb-10 w-full max-w-2xl mx-auto leading-relaxed px-2">
            {t("heroDescription")}
          </p>

          <div className="w-full flex justify-center px-2">
            <HeroSearchBar className="w-full max-w-3xl lg:max-w-4xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
