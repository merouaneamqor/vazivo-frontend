"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { getInitials, getBusinessPath } from "@/lib/utils";
import type { Business } from "@/types";

interface SimilarBusinessesProps {
  category: string;
  city: string;
  currentBusinessId: number;
}

export function SimilarBusinesses({ category, city, currentBusinessId }: SimilarBusinessesProps) {
  const t = useTranslations("businessPage");

  const { data } = useQuery<{ businesses: Business[] }>({
    queryKey: ["similar-businesses", category, city, currentBusinessId],
    queryFn: async () => {
      const params = new URLSearchParams({
        category,
        city,
        premium: "true",
        limit: "5",
      });
      const res = await fetch(`/api/v1/public/businesses?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const businesses = data?.businesses?.filter((b) => b.id !== currentBusinessId).slice(0, 5) || [];

  if (businesses.length === 0) return null;

  return (
    <div className=" border border-neutral-200 bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t("similarBusinesses", { city })}
      </h3>
      <div className="space-y-3">
        {businesses.map((business) => (
          <Link
            key={business.id}
            href={getBusinessPath(business)}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Avatar className="h-12 w-12 shrink-0 rounded-lg border border-neutral-100">
              {business.logo_url && (
                <AvatarImage src={business.logo_url} alt={business.name} />
              )}
              <AvatarFallback className="rounded-lg text-sm">
                {getInitials(business.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {business.name}
              </h4>
              <p className="text-xs text-neutral-500 truncate">{business.address}</p>
              <div className="flex items-center gap-1 mt-1">
                <RatingStars rating={Number(business.average_rating) || 0} size="sm" />
                <span className="text-xs text-neutral-500">
                  ({business.total_reviews || 0})
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
