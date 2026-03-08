"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BusinessCardSkeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useState } from "react";

const BusinessGrid = dynamic(
  () => import("@/components/BusinessPreviewCard").then((m) => ({ default: m.BusinessGrid })),
  { ssr: true, loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">{[1, 2, 3, 4, 5].map((i) => <BusinessCardSkeleton key={i} />)}</div> }
);

export function FeaturedBusinessesSection() {
  const t = useTranslations("home");
  const [limit, setLimit] = useState(5);

  const { data: businessesData, isLoading } = useQuery({
    queryKey: queryKeys.businesses.list({ per_page: limit, sort_by: "rating" }),
    queryFn: () => api.getBusinesses({ per_page: limit, sort_by: "rating" }),
  });

  const businesses = businessesData?.businesses?.slice(0, limit) || [];

  return (
    <section className="py-16 md:py-24 bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 md:mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-2">
              {t("bestRated")}
            </h2>
            <p className="text-neutral-600">
              {t("bestRatedDesc")}
            </p>
          </div>
          <Link href="/search?sort=rating" className="hidden md:block">
            <Button variant="ghost" className="group">
              {t("seeAll")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <>
            <BusinessGrid businesses={businesses} variant="featured" showAvailable />
            
            {businesses.length < 10 && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setLimit(10)}>
                  {t("viewAllBusinesses")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500">{t("noBusinessesFound")}</p>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link href="/search">
            <Button variant="outline">
              {t("viewAllBusinesses")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
