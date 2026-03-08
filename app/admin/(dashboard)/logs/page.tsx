"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminDashboard, useAdminActivityLog } from "@/features/admin";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminLogsPage() {
  const t = useTranslations("adminLogs");
  const [page, setPage] = useState(1);

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useAdminDashboard();
  const { data: logData, isLoading: logLoading, error: logError } = useAdminActivityLog({
    page,
    per_page: 25,
  });

  const error = dashboardError || logError;
  if (error) {
    return (
      <div className="space-y-6 p-3 md:p-4">
        <p className="text-red-600">{t("loadError")}</p>
      </div>
    );
  }

  const logs = logData?.logs ?? [];
  const meta = logData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.current_page ?? 1;

  const detailsMessage = (entry: { details?: Record<string, unknown> | null }) => {
    const d = entry.details;
    if (!d || typeof d !== "object") return null;
    const msg = (d as { message?: string }).message;
    return typeof msg === "string" ? msg : null;
  };

  return (
    <div className="space-y-6 p-3 md:p-4">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-xs md:text-sm text-neutral-500 mt-0.5">{t("subtitle")}</p>
      </div>

      {/* Admin actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t("adminActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : logs.length === 0 ? (
            <p className="text-neutral-500 text-sm py-8 text-center">{t("noAdminActions")}</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-2 font-medium text-neutral-600">{t("date")}</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600">{t("admin")}</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600">{t("action")}</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600">{t("resource")}</th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600">{t("details")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((entry) => (
                      <tr key={entry.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-2.5 px-2 text-neutral-600 whitespace-nowrap">
                          {entry.created_at
                            ? format(new Date(entry.created_at), "MMM d, yyyy HH:mm")
                            : "—"}
                        </td>
                        <td className="py-2.5 px-2 text-neutral-900">{entry.admin_user_name ?? "—"}</td>
                        <td className="py-2.5 px-2">
                          <span className="font-medium text-neutral-900">{entry.action}</span>
                        </td>
                        <td className="py-2.5 px-2 text-neutral-700">
                          {entry.resource_type}
                          {entry.resource_id ? ` #${entry.resource_id}` : ""}
                        </td>
                        <td className="py-2.5 px-2 text-neutral-600 max-w-xs truncate">
                          {detailsMessage(entry) ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500">
                    {t("pageOf", { current: currentPage, total: totalPages })}
                    {meta?.total_count != null && ` (${t("totalCount", { count: meta.total_count })})`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent activity (bookings + reviews) */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-700 mb-3">{t("recentActivity")}</h2>
        {dashboardLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : dashboardData?.recent_activity ? (
          <ActivityFeed
            bookings={dashboardData.recent_activity.bookings}
            reviews={dashboardData.recent_activity.reviews}
          />
        ) : (
          <p className="text-neutral-500 text-sm">{t("noActivity")}</p>
        )}
      </div>
    </div>
  );
}
