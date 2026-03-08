"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Calendar, DollarSign, Star, Eye, TrendingUp, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartJsBarCard, ChartJsDonutCard } from "@/components/admin/ChartJsCharts";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function ProviderOverviewPage() {
  const t = useTranslations("providerStats");
  const { selectedBusinessId } = useProviderBusiness();

  const { data: statsData } = useQuery({
    queryKey: queryKeys.provider.stats(selectedBusinessId),
    queryFn: () => api.getProviderStats(selectedBusinessId),
    enabled: !!selectedBusinessId,
  });

  const stats = statsData || {
    total_bookings: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    total_revenue: 0,
    average_rating: 0,
    total_reviews: 0,
  };

  const weeklyBookings = [
    { label: t("mon"), value: 12 },
    { label: t("tue"), value: 8 },
    { label: t("wed"), value: 15 },
    { label: t("thu"), value: 10 },
    { label: t("fri"), value: 18 },
    { label: t("sat"), value: 22 },
    { label: t("sun"), value: 5 },
  ];

  const bookingStatusData = [
    { label: t("statusCompleted"), value: stats.completed_bookings, color: "#22c55e" },
    { label: t("statusPending"), value: stats.pending_bookings, color: "#f59e0b" },
    {
      label: t("statusCancelled"),
      value: Math.max(0, stats.total_bookings - stats.completed_bookings - stats.pending_bookings),
      color: "#ef4444",
    },
  ];

  const avgRating = Number(stats.average_rating) || 0;
  const completionRate = stats.total_bookings > 0
    ? Math.round((stats.completed_bookings / stats.total_bookings) * 100)
    : 0;

  return (
    <div className="space-y-3 p-3 md:p-4">
      {/* KPIs - Compact Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title={t("totalBookings")}
          value={stats.total_bookings}
          icon={Calendar}
        />
        <KpiCard
          title={t("revenue")}
          value={formatPrice(stats.total_revenue)}
          icon={DollarSign}
        />
        <KpiCard
          title={t("avgRating")}
          value={avgRating > 0 ? avgRating.toFixed(1) : t("noRatingsYet")}
          icon={Star}
        />
        <KpiCard
          title={t("totalReviews")}
          value={stats.total_reviews ?? 0}
          icon={Eye}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500">{t("pending")}</p>
                <p className="text-lg font-bold text-neutral-900 mt-0.5">
                  {stats.pending_bookings}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500">{t("completion")}</p>
                <p className="text-lg font-bold text-neutral-900 mt-0.5">
                  {completionRate}%
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500">{t("completed")}</p>
                <p className="text-lg font-bold text-neutral-900 mt-0.5">
                  {stats.completed_bookings}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Compact Stack */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartJsBarCard
          title={t("weeklyBookings")}
          data={weeklyBookings}
          height={180}
          barColor="rgb(224 99 82)"
        />
        <ChartJsDonutCard
          title={t("bookingStatus")}
          data={bookingStatusData}
          centerValue={stats.total_bookings}
          centerLabel={t("total")}
          size={140}
        />
      </div>
    </div>
  );
}

