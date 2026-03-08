"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const CategoryGrid = dynamic(
  () => import("@/components/CategoryCard").then((m) => ({ default: m.CategoryGrid })),
  { ssr: true, loading: () => <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6"><div className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" /><div className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" /><div className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" /><div className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" /><div className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" /></div> }
);

const CategoryList = dynamic(
  () => import("@/components/CategoryCard").then((m) => ({ default: m.CategoryList })),
  { ssr: true, loading: () => <div className="flex gap-3 overflow-x-auto pb-2"><div className="flex-shrink-0 w-32 h-10 bg-neutral-100 rounded-full animate-pulse" /><div className="flex-shrink-0 w-32 h-10 bg-neutral-100 rounded-full animate-pulse" /><div className="flex-shrink-0 w-32 h-10 bg-neutral-100 rounded-full animate-pulse" /></div> }
);

export function CategoriesSection() {
  const t = useTranslations("home");

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            {t("exploreCategories")}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {t("exploreCategoriesDesc")}
          </p>
        </motion.div>

        <div className="md:hidden">
          <CategoryList />
        </div>
        
        <div className="hidden md:block">
          <CategoryGrid />
        </div>
      </div>
    </section>
  );
}
