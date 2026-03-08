"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Building2, Edit2, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { getBusinessPath, getBusinessCityDisplay, getBusinessCategoryDisplay } from "@/lib/utils";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating-stars";

export default function ProviderBusinessesPage() {
  const t = useTranslations("providerBusinesses");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.provider.businesses,
    queryFn: () => api.getProviderBusinesses(),
  });

  const businesses = data?.businesses ?? [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Building2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">
                  {t("title")}
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {t("description")}
                </p>
              </div>
            </div>
            <Link href="/provider/businesses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("addBusiness")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white  animate-pulse border border-neutral-200"
              />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-3">{t("noBusinessesYet")}</p>
            <p className="text-sm text-neutral-400 mb-4">
              {t("createFirstHint")}
            </p>
            <Link href="/provider/businesses/new">
              <Button>{t("createBusiness")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex items-center justify-between p-4  border border-neutral-200 bg-white hover:border-primary-200 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-neutral-900 truncate">
                      {business.name}
                    </h3>
                    {getBusinessCategoryDisplay(business.category) && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 shrink-0">
                        {getBusinessCategoryDisplay(business.category)}
                      </span>
                    )}
                  </div>
                  {getBusinessCityDisplay(business.city) && (
                    <p className="text-sm text-neutral-500">{getBusinessCityDisplay(business.city)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <RatingStars
                      rating={business.average_rating}
                      size="sm"
                    />
                    <span className="text-xs text-neutral-500">
                      {t("reviewsCount", { count: business.total_reviews ?? 0 })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Link
                    href={getBusinessPath(business)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      {t("view")}
                    </Button>
                  </Link>
                  <Link href={`/provider/businesses/${business.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      {t("edit")}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
