"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CityGrid = dynamic(
  () => import("@/components/CityCard").then((m) => ({ default: m.CityGrid })),
  { ssr: true, loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"><div className="h-48 bg-neutral-100 rounded-2xl animate-pulse" /><div className="h-48 bg-neutral-100 rounded-2xl animate-pulse" /><div className="h-48 bg-neutral-100 rounded-2xl animate-pulse" /></div> }
);

const CityList = dynamic(
  () => import("@/components/CityCard").then((m) => ({ default: m.CityList })),
  { ssr: true, loading: () => <div className="flex gap-3 overflow-x-auto pb-2"><div className="flex-shrink-0 w-40 h-24 bg-neutral-100 rounded-xl animate-pulse" /><div className="flex-shrink-0 w-40 h-24 bg-neutral-100 rounded-xl animate-pulse" /></div> }
);

export function PopularCitiesSection() {
  const t = useTranslations("home");

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 md:mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-2">
              {t("popularCities")}
            </h2>
            <p className="text-neutral-600">
              {t("popularCitiesDesc")}
            </p>
          </div>
          <Link href="/search" className="hidden md:block">
            <Button variant="ghost" className="group">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="md:hidden">
          <CityList />
        </div>
        
        <div className="hidden md:block">
          <CityGrid limit={5} />
        </div>
      </div>
    </section>
  );
}
