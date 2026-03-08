"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FileText, Banknote, TrendingUp, ArrowRight, Receipt, Wallet as WalletIcon } from "lucide-react";
import {
  useAdminInvoices,
  adminService,
} from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { KpiCard } from "@/components/admin/KpiCard";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminFinancePage() {
  const t = useTranslations("adminFinance");

  const { data: invoicesData } = useAdminInvoices();
  const { data: earnings } = useQuery({
    queryKey: [...queryKeys.admin.finance, "earnings"],
    queryFn: adminService.getEarnings,
  });

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">{t("overviewTitle")}</h1>
          <p className="text-neutral-500 mt-1">{t("overviewSubtitle")}</p>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title={t("subscriptionRevenue")}
          value={invoicesData?.stats ? formatPrice(invoicesData.stats.total_revenue) : "—"}
          subtitle={`${invoicesData?.stats?.paid_count || 0} ${t("paidInvoices")}`}
          icon={Receipt}
        />
        <KpiCard
          title={t("bookingCommissions")}
          value={earnings ? formatPrice(earnings.total_commission) : "—"}
          subtitle={t("fromCustomerBookings")}
          icon={Banknote}
        />
        <KpiCard
          title={t("pendingRevenue")}
          value={invoicesData?.stats ? formatPrice(invoicesData.stats.pending_revenue) : "—"}
          subtitle={`${invoicesData?.stats?.by_status?.pending || 0} ${t("pendingInvoices")}`}
          icon={WalletIcon}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/invoices">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-5 w-5 text-primary-600" />
                    <h3 className="font-semibold text-neutral-900">{t("businessInvoicesCard")}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    {t("businessInvoicesDesc")}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900">{invoicesData?.stats?.total_count || 0}</p>
                      <p className="text-xs text-neutral-500">{t("totalInvoices")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{invoicesData?.stats?.paid_count || 0}</p>
                      <p className="text-xs text-neutral-500">{t("paid")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{invoicesData?.stats?.by_status?.pending || 0}</p>
                      <p className="text-xs text-neutral-500">{t("pending")}</p>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-neutral-900">{t("bookingPaymentsCard")}</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  {t("bookingPaymentsDesc")}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{formatPrice(earnings?.total_commission || 0)}</p>
                    <p className="text-xs text-neutral-500">{t("totalEarnings")}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary-600" />
              {t("subscriptionRevenueByMonth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoicesData?.stats?.by_month &&
                Object.entries(invoicesData.stats.by_month)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm font-medium text-neutral-700">{month}</span>
                      <span className="text-sm font-bold text-neutral-900">{formatPrice(Number(amount))}</span>
                    </div>
                  ))}
              {(!invoicesData?.stats?.by_month || Object.keys(invoicesData.stats.by_month).length === 0) && (
                <p className="text-sm text-neutral-500 py-4 text-center">{t("noData")}</p>
              )}
            </div>
            <Link href="/admin/invoices">
              <Button variant="outline" size="sm" className="w-full mt-4">
                {t("viewAllInvoices")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />
              {t("bookingEarningsByMonth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnings?.by_month &&
                Object.entries(earnings.by_month)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm font-medium text-neutral-700">{month}</span>
                      <span className="text-sm font-bold text-neutral-900">{formatPrice(Number(amount))}</span>
                    </div>
                  ))}
              {(!earnings?.by_month || Object.keys(earnings.by_month).length === 0) && (
                <p className="text-sm text-neutral-500 py-4 text-center">{t("noData")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
