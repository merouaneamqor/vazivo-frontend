"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Calendar,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
  Building2,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating-stars";
import { StatCard, ProgressRing } from "@/components/ui/chart";
import { ChartJsBarCard, ChartJsDonutCard } from "@/components/admin/ChartJsCharts";
import { formatPrice, getBusinessPath, getBusinessCategoryDisplay } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface ProviderStatsProps {
  businessId?: number;
}

export function ProviderStats({ businessId }: ProviderStatsProps) {
  const t = useTranslations("providerStats");

  const { data: businessesData, isLoading } = useQuery({
    queryKey: queryKeys.provider.businesses,
    queryFn: () => api.getProviderBusinesses(),
  });

  const businesses = businessesData?.businesses || [];
  const targetBusinessId = businessId || businesses[0]?.id;

  // Get stats for the business using provider API
  const { data: statsData } = useQuery({
    queryKey: queryKeys.provider.stats(targetBusinessId),
    queryFn: () => api.getProviderStats(targetBusinessId),
    enabled: !!targetBusinessId,
  });

  const stats = statsData || {
    total_bookings: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    total_revenue: 0,
    average_rating: 0,
    total_reviews: 0,
  };

  // Mock data for charts (replace with real API data)
  const weeklyBookings = [
    { label: t("mon"), value: 12, color: "bg-primary-400" },
    { label: t("tue"), value: 8, color: "bg-primary-400" },
    { label: t("wed"), value: 15, color: "bg-primary-400" },
    { label: t("thu"), value: 10, color: "bg-primary-400" },
    { label: t("fri"), value: 18, color: "bg-primary-500" },
    { label: t("sat"), value: 22, color: "bg-primary-500" },
    { label: t("sun"), value: 5, color: "bg-primary-300" },
  ];

  const bookingStatusData = [
    { label: t("statusCompleted"), value: stats.completed_bookings, color: "#22c55e" },
    { label: t("statusPending"), value: stats.pending_bookings, color: "#f59e0b" },
    {
      label: t("statusCancelled"),
      value: Math.max(
        0,
        stats.total_bookings - stats.completed_bookings - stats.pending_bookings
      ),
      color: "#ef4444",
    },
  ];

  const completionRate =
    stats.total_bookings > 0
      ? Math.round((stats.completed_bookings / stats.total_bookings) * 100)
      : 0;

  const avgRating = Number(stats.average_rating) || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalBookings")}
          value={stats.total_bookings}
          trend={{ value: 12, isPositive: true }}
          sparklineData={[4, 6, 8, 5, 9, 12, 10]}
          icon={<Calendar className="h-5 w-5 text-primary-500" />}
        />
        <StatCard
          title={t("revenue")}
          value={formatPrice(stats.total_revenue)}
          trend={{ value: 8, isPositive: true }}
          sparklineData={[200, 350, 280, 420, 380, 500, 450]}
          icon={<DollarSign className="h-5 w-5 text-success-500" />}
        />
        <StatCard
          title={t("avgRating")}
          value={avgRating > 0 ? avgRating.toFixed(1) : t("noRatingsYet")}
          trend={{ value: 0.2, isPositive: true }}
          icon={<Star className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title={t("totalReviews")}
          value={stats.total_reviews ?? 0}
          trend={{ value: 5, isPositive: true }}
          icon={<Eye className="h-5 w-5 text-lavender-500" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Bookings Chart (Chart.js) */}
        <ChartJsBarCard
          title={t("weeklyBookings")}
          data={weeklyBookings}
          height={180}
          className="card-premium lg:col-span-2"
          barColor="rgb(224 99 82)"
        />

        {/* Booking Status (Chart.js Doughnut) */}
        <ChartJsDonutCard
          title={t("bookingStatus")}
          data={bookingStatusData}
          centerValue={stats.total_bookings}
          centerLabel={t("total")}
          size={140}
          className="card-premium"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentBookings")}</CardTitle>
            <Link href="/provider/bookings">
              <Button variant="ghost" size="sm">
                {t("viewAll")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <RecentBookingsList businessId={targetBusinessId} />
          </CardContent>
        </Card>

        {/* Performance & Businesses */}
        <div className="space-y-6">
          {/* Completion Rate */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-base">{t("performance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                <ProgressRing
                  value={completionRate}
                  color="#22c55e"
                  label={t("completion")}
                />
                <div className="text-center">
                  <p className="text-3xl font-bold text-neutral-900">
                    {stats.pending_bookings}
                  </p>
                  <p className="text-sm text-neutral-500">{t("pending")}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-neutral-900">
                    {stats.total_reviews}
                  </p>
                  <p className="text-sm text-neutral-500">{t("reviews")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Businesses List */}
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base">{t("yourBusinesses")}</CardTitle>
              <div className="flex items-center gap-1">
                <Link href="/provider/businesses">
                  <Button variant="ghost" size="sm">
                    {t("viewAll")}
                  </Button>
                </Link>
                <Link href="/provider/businesses/new">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 bg-neutral-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-6">
                  <Building2 className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500 mb-3">
                    {t("noBusinessesYet")}
                  </p>
                  <Link href="/provider/businesses/new">
                    <Button size="sm">{t("createBusiness")}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {businesses.slice(0, 3).map((business) => (
                    <div
                      key={business.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <Link
                        href={getBusinessPath(business)}
                        className="min-w-0 flex-1"
                      >
                        <p className="font-medium text-neutral-900 truncate">
                          {business.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {getBusinessCategoryDisplay(business.category)}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2">
                        <RatingStars rating={business.average_rating} size="sm" />
                        <Link href={`/provider/businesses/${business.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            {t("edit")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Recent bookings list sub-component
function RecentBookingsList({ businessId }: { businessId?: number }) {
  const t = useTranslations("providerStats");
  const { data: bookingsData } = useQuery({
    queryKey: ["provider", "bookings", businessId, "recent"],
    queryFn: () =>
      businessId
        ? api.getBusinessBookings(businessId, { per_page: 5, status: "all" })
        : Promise.resolve({
            bookings: [],
            meta: { current_page: 1, total_pages: 0, total_count: 0, per_page: 5 },
          }),
    enabled: !!businessId,
  });

  const bookings = bookingsData?.bookings || [];

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        {t("noRecentBookings")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-neutral-900 text-sm truncate">
              {booking.service_name}
            </p>
            <p className="text-xs text-neutral-500">
              {booking.customer_name} • {format(parseISO(booking.date), "MMM d")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              {formatPrice(booking.total_price ?? 0)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
