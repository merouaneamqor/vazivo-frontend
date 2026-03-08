"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAdminReports } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { ChartJsBarCard } from "@/components/admin/ChartJsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, TrendingUp, TrendingDown, Users, Building2, Calendar, Star, CreditCard, DollarSign, Activity, Target } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { format, subDays } from "date-fns";

function buildDailyChartSeries(raw: Record<string, number> | undefined, days = 30) {
  if (!raw) return [];
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = subDays(today, days - 1 - i);
    const key = format(d, "yyyy-MM-dd");
    return { label: format(d, "MMM d"), value: raw[key] ?? 0 };
  });
}

export default function AdminReportsPage() {
  const t = useTranslations("adminReports");
  const [dateRange, setDateRange] = useState("30");

  const { data, isLoading } = useAdminReports();

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendIcon = (current: number, previous: number) => {
    return current >= previous ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    return current >= previous ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">Reports & Analytics</h1>
          <p className="text-neutral-500 mt-1">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32 " />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Revenue Overview */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Revenue Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">Total Revenue</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {formatPrice(data.revenue.current)}
                      </p>
                      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${getTrendColor(data.revenue.current, data.revenue.previous)}`}>
                        {getTrendIcon(data.revenue.current, data.revenue.previous)}
                        {getTrend(data.revenue.current, data.revenue.previous)}% vs previous period
                      </div>
                    </div>
                    <div className="p-3  bg-emerald-50">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">Subscription Revenue</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {formatPrice(data.subscriptions.revenue)}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {data.subscriptions.new} new subscriptions
                      </p>
                    </div>
                    <div className="p-3  bg-blue-50">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-3">Revenue by Payment Method</p>
                    <div className="space-y-2">
                      {Object.entries(data.revenue.by_payment_method).map(([method, amount]) => (
                        <div key={method} className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600 capitalize">{method || "Unknown"}</span>
                          <span className="text-sm font-semibold text-neutral-900">{formatPrice(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-3">Subscriptions by Plan</p>
                    <div className="space-y-2">
                      {Object.entries(data.subscriptions.by_plan).map(([plan, count]) => (
                        <div key={plan} className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">{plan}</span>
                          <span className="text-sm font-semibold text-neutral-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bookings Overview */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-600" />
              Bookings Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">Total Bookings</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {data.bookings.current}
                      </p>
                      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${getTrendColor(data.bookings.current, data.bookings.previous)}`}>
                        {getTrendIcon(data.bookings.current, data.bookings.previous)}
                        {getTrend(data.bookings.current, data.bookings.previous)}% vs previous period
                      </div>
                    </div>
                    <div className="p-3  bg-violet-50">
                      <Calendar className="h-6 w-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-3">Bookings by Status</p>
                    <div className="space-y-2">
                      {Object.entries(data.bookings.by_status).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600 capitalize">{status}</span>
                          <span className="text-sm font-semibold text-neutral-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">Average Rating</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {data.reviews.average_rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        From {data.reviews.total} reviews
                      </p>
                    </div>
                    <div className="p-3  bg-amber-50">
                      <Star className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-3">Reviews by Rating</p>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-xs text-neutral-600 w-3">{rating}</span>
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{
                                width: `${((data.reviews.by_rating[rating] || 0) / data.reviews.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-neutral-600 w-8 text-right">
                            {data.reviews.by_rating[rating] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Provider & Customer Metrics */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Growth Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">New Providers</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {data.providers.new}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {data.providers.active} active providers
                      </p>
                    </div>
                    <div className="p-3  bg-indigo-50">
                      <Building2 className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">New Customers</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {data.customers.new}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {data.customers.active} active customers
                      </p>
                    </div>
                    <div className="p-3  bg-pink-50">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">Customer Retention</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {data.customers.retention_rate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        Returning customers
                      </p>
                    </div>
                    <div className="p-3  bg-green-50">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-500">Subscription Churn</p>
                      <p className="text-2xl font-display font-bold text-neutral-900 mt-1">
                        {data.subscriptions.churned}
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        Expired subscriptions
                      </p>
                    </div>
                    <div className="p-3  bg-red-50">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartJsBarCard
              title="Revenue Trend"
              data={buildDailyChartSeries(data.revenue.by_day, parseInt(dateRange))}
              height={280}
              barColor="#10b981"
            />
            <ChartJsBarCard
              title="Bookings Trend"
              data={buildDailyChartSeries(data.bookings.by_day, parseInt(dateRange))}
              height={280}
              barColor="#8b5cf6"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartJsBarCard
              title="Top Cities by Bookings"
              data={Object.entries(data.bookings.by_city).map(([name, value]) => ({ label: name, value }))}
              height={280}
              horizontal
              barColor="#6366f1"
            />
            <ChartJsBarCard
              title="Top Categories by Bookings"
              data={Object.entries(data.bookings.by_category).map(([name, value]) => ({ label: name, value }))}
              height={280}
              horizontal
              barColor="#8b5cf6"
            />
          </div>

          {/* Top Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.providers.top.map((provider, idx) => (
                  <div key={provider.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{provider.name}</p>
                        <p className="text-xs text-neutral-500">ID: {provider.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">{provider.bookings}</p>
                      <p className="text-xs text-neutral-500">bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
