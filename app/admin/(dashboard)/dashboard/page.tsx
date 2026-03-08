"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calendar, Banknote, Building2, UserCheck, Users, ArrowRight, TrendingUp, Award, CheckCircle, CreditCard, Repeat } from "lucide-react";
import { format, subDays } from "date-fns";
import { useAdminDashboard } from "@/features/admin";
import { formatPrice } from "@/lib/utils";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartJsBarCard, ChartJsDonutCard } from "@/components/admin/ChartJsCharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Build a full 30-day series sorted by date, with missing days as 0. Labels as "Jan 15". */
function buildDailyChartSeries(
  raw: Record<string, number> | undefined,
  days = 30
): { label: string; value: number; color?: string }[] {
  if (!raw || typeof raw !== "object") {
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
      const d = subDays(today, days - 1 - i);
      return { label: format(d, "MMM d"), value: 0 };
    });
  }
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = subDays(today, days - 1 - i);
    const key = format(d, "yyyy-MM-dd");
    const value = raw[key] ?? 0;
    return { label: format(d, "MMM d"), value: Number(value) };
  });
}

/** Same but for revenue: format values and use a color. */
function buildRevenueChartSeries(
  raw: Record<string, number> | undefined,
  days = 30
): { label: string; value: number; color?: string }[] {
  const series = buildDailyChartSeries(raw, days);
  return series.map((item) => ({
    ...item,
    value: Math.round(item.value),
    color: "bg-emerald-500",
  }));
}

/** Build donut data for booking status with labels and colors. */
function buildBookingsByStatusDonut(
  raw: Record<string, number> | undefined,
  t: (key: string) => string
): { label: string; value: number; color: string }[] {
  if (!raw || typeof raw !== "object") return [];
  const statusKeys = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
  const statusLabelKey: Record<string, string> = {
    pending: "statusPending",
    confirmed: "statusConfirmed",
    completed: "statusCompleted",
    cancelled: "statusCancelled",
    no_show: "statusNoShow",
  };
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    completed: "#22c55e",
    cancelled: "#ef4444",
    no_show: "#6b7280",
  };
  return statusKeys
    .filter((k) => (raw[k] ?? 0) > 0)
    .map((k) => ({
      label: t(statusLabelKey[k] ?? k),
      value: Number(raw[k]) ?? 0,
      color: colors[k] ?? "#94a3b8",
    }));
}

/** Build donut data for rating distribution (1–5 stars). */
function buildRatingDistributionDonut(
  raw: Record<string, number> | undefined
): { label: string; value: number; color: string }[] {
  if (!raw || typeof raw !== "object") return [];
  const starColors: Record<number, string> = {
    1: "#ef4444",
    2: "#f97316",
    3: "#eab308",
    4: "#84cc16",
    5: "#22c55e",
  };
  return [1, 2, 3, 4, 5].map((star) => ({
    label: `${star} ★`,
    value: Number(raw[String(star)]) ?? 0,
    color: starColors[star] ?? "#94a3b8",
  })).filter((d) => d.value > 0);
}

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard");

  const { data, isLoading, error } = useAdminDashboard();

  const getTrend = (current: number, previous: number): "up" | "down" | "neutral" => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "neutral";
  };

  const getTrendPercent = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="space-y-6 p-3 md:p-4">
        <p className="text-red-600">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/providers">
            <Button variant="outline" size="sm">{t("viewProviders")}</Button>
          </Link>
          <Link href="/admin/bookings">
            <Button size="sm">
              {t("viewAllBookings")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : data?.kpis ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              title={t("kpiBookingsToday")}
              value={data.kpis.bookings_today}
              subtitle={getTrendPercent(data.kpis.bookings_today, data.kpis.bookings_yesterday)}
              icon={Calendar}
              trend={getTrend(data.kpis.bookings_today, data.kpis.bookings_yesterday)}
            />
            <KpiCard
              title={t("kpiRevenueToday")}
              value={formatPrice(Number(data.kpis.revenue_today))}
              subtitle={getTrendPercent(data.kpis.revenue_today, data.kpis.revenue_yesterday)}
              icon={Banknote}
              trend={getTrend(data.kpis.revenue_today, data.kpis.revenue_yesterday)}
            />
            <KpiCard
              title={t("kpiNewCustomers")}
              value={data.kpis.new_customers_week}
              subtitle={getTrendPercent(data.kpis.new_customers_week, data.kpis.new_customers_last_week)}
              icon={Users}
              trend={getTrend(data.kpis.new_customers_week, data.kpis.new_customers_last_week)}
            />
            <KpiCard
              title={t("kpiPendingApprovals")}
              value={data.kpis.pending_provider_approvals}
              subtitle={t("requiresAction")}
              icon={UserCheck}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("monthlyBookings")}</p>
                    <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">
                      {data.kpis.total_bookings_month}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-violet-50">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("monthlyRevenue")}</p>
                    <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">
                      {formatPrice(Number(data.kpis.total_revenue_month))}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-emerald-50">
                    <Banknote className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("activeSubscriptions")}</p>
                    <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">
                      {data.kpis.active_subscriptions}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      +{data.kpis.new_subscriptions_month} {t("thisMonth")}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-indigo-50">
                    <Repeat className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("mrr")}</p>
                    <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">
                      {formatPrice(Number(data.kpis.mrr))}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-green-50">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("subscriptionsByPlan")}</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(data.kpis.subscriptions_by_plan).map(([plan, count]) => (
                        <div key={plan} className="flex justify-between text-sm">
                          <span className="text-neutral-600">{plan}</span>
                          <span className="font-semibold text-neutral-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("premiumProviders")}</p>
                    <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">
                      {data.kpis.premium_providers}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {t("of")} {data.kpis.active_providers} {t("total")}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-amber-50">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-neutral-500">{t("verifiedProviders")}</p>
                    <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">
                      {data.kpis.verified_providers}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {t("of")} {data.kpis.active_providers} {t("total")}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-lg bg-blue-50">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {data?.charts && (
          <>
            <ChartJsBarCard
              title={t("chartBookingsByDay")}
              data={buildDailyChartSeries(
                data.charts.bookings_by_day as Record<string, number> | undefined
              )}
              height={200}
              barColor="#8b5cf6"
            />
            <ChartJsBarCard
              title={t("chartRevenueByDay")}
              data={buildRevenueChartSeries(
                data.charts.revenue_by_day as Record<string, number> | undefined
              )}
              height={200}
              barColor="#10b981"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {data?.charts?.reviews_by_day !== undefined && (
          <ChartJsBarCard
            title={t("chartReviewsByDay")}
            data={buildDailyChartSeries(
              data.charts.reviews_by_day as Record<string, number>
            )}
            height={200}
            barColor="#6366f1"
          />
        )}
        {data?.charts?.new_customers_by_day !== undefined && (
          <ChartJsBarCard
            title={t("chartNewCustomersByDay")}
            data={buildDailyChartSeries(
              data.charts.new_customers_by_day as Record<string, number>
            )}
            height={200}
            barColor="#0ea5e9"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {data?.charts?.bookings_by_status && buildBookingsByStatusDonut(data.charts.bookings_by_status as Record<string, number>, t).length > 0 && (
          <ChartJsDonutCard
            title={t("chartBookingsByStatus")}
            data={buildBookingsByStatusDonut(data.charts.bookings_by_status as Record<string, number>, t)}
            centerValue={Object.values(data.charts.bookings_by_status).reduce((a, b) => a + Number(b), 0)}
            centerLabel={t("total")}
            size={180}
          />
        )}
        {data?.charts?.rating_distribution && buildRatingDistributionDonut(data.charts.rating_distribution as Record<string, number>).length > 0 && (
          <ChartJsDonutCard
            title={t("chartRatingDistribution")}
            data={buildRatingDistributionDonut(data.charts.rating_distribution as Record<string, number>)}
            centerValue={Object.values(data.charts.rating_distribution).reduce((a, b) => a + Number(b), 0)}
            centerLabel={t("total")}
            size={180}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {data?.charts?.top_cities?.length ? (
          <ChartJsBarCard
            title={t("chartTopCities")}
            data={data.charts.top_cities.map((c) => ({ label: c.name, value: c.value }))}
            height={180}
            horizontal
            barColor="#6366f1"
          />
        ) : null}
        {data?.charts?.top_categories?.length ? (
          <ChartJsBarCard
            title={t("chartTopCategories")}
            data={data.charts.top_categories.map((c) => ({ label: c.name, value: c.value }))}
            height={180}
            horizontal
            barColor="#8b5cf6"
          />
        ) : null}
      </div>
    </div>
  );
}
