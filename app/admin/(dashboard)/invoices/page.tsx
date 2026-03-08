"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, Download, Filter, X, FileText, DollarSign, Clock, CheckCircle, AlertCircle, ChevronDown, TrendingUp, Calendar as CalendarIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useAdminInvoices } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/admin/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/admin/Pagination";
import { Badge } from "@/components/ui/badge";
import type { InvoiceFilters } from "@/types/invoice";

const DEBOUNCE_MS = 300;

const defaultFilters: InvoiceFilters = {
  page: 1,
  per_page: 20,
};

export default function AdminInvoicesPage() {
  const t = useTranslations("adminInvoices");
  const [filters, setFilters] = useState<InvoiceFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useAdminInvoices(filters);

  const debouncedSetQ = useCallback((value: string) => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: value || undefined, page: 1 }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (searchInput === (filters.q ?? "")) return;
    const cancel = debouncedSetQ(searchInput);
    return cancel;
  }, [searchInput, filters.q, debouncedSetQ]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchInput("");
  };

  const updateFilter = (key: keyof InvoiceFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasActiveFilters = 
    filters.status || 
    filters.payment_method || 
    filters.paid_after || 
    filters.paid_before || 
    filters.min_amount || 
    filters.max_amount ||
    filters.q;

  const activeFilterCount = [
    filters.status,
    filters.payment_method,
    filters.paid_after,
    filters.paid_before,
    filters.min_amount,
    filters.max_amount,
    filters.q,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4 mr-2" />
          {t("export")}
        </Button>
      </div>

      {/* Stats Overview */}
      {data?.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title={t("totalRevenue")}
            value={formatPrice(data.stats.total_revenue)}
            subtitle={`${data.stats.paid_count} ${t("paidInvoices")}`}
            icon={DollarSign}
            trend="up"
          />
          <KpiCard
            title={t("pendingRevenue")}
            value={formatPrice(data.stats.pending_revenue)}
            subtitle={`${data.stats.by_status.pending || 0} ${t("pending")}`}
            icon={Clock}
            trend="neutral"
          />
          <KpiCard
            title={t("totalInvoices")}
            value={data.stats.total_count}
            subtitle={t("allTime")}
            icon={FileText}
          />
          <KpiCard
            title={t("paymentMethods")}
            value={Object.keys(data.stats.by_payment_method).length}
            subtitle={`${Object.values(data.stats.by_payment_method).reduce((a, b) => a + b, 0)} transactions`}
            icon={CreditCard}
          />
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 rounded-lg border-neutral-200"
              />
            </div>

            <select
              value={filters.status || ""}
              onChange={(e) => updateFilter("status", e.target.value || undefined)}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm min-w-[140px] bg-white"
            >
              <option value="">All Statuses</option>
              <option value="paid">✓ Paid</option>
              <option value="pending">⏱ Pending</option>
              <option value="failed">✗ Failed</option>
            </select>

            <select
              value={filters.payment_method || ""}
              onChange={(e) => updateFilter("payment_method", e.target.value || undefined)}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm min-w-[140px] bg-white"
            >
              <option value="">All Methods</option>
              <option value="cash">💵 Cash</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
              <option value="stripe">💳 Stripe</option>
            </select>

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {t("moreFilters")}
              {activeFilterCount > 2 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFilterCount - 2}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                {t("clearAll")}
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 mb-2">
                    <CalendarIcon className="h-3 w-3" />
                    Paid After
                  </label>
                  <input
                    type="date"
                    value={filters.paid_after || ""}
                    onChange={(e) => updateFilter("paid_after", e.target.value || undefined)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 mb-2">
                    <CalendarIcon className="h-3 w-3" />
                    Paid Before
                  </label>
                  <input
                    type="date"
                    value={filters.paid_before || ""}
                    onChange={(e) => updateFilter("paid_before", e.target.value || undefined)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 mb-2">
                    <DollarSign className="h-3 w-3" />
                    Amount Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.min_amount || ""}
                      onChange={(e) => updateFilter("min_amount", e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.max_amount || ""}
                      onChange={(e) => updateFilter("max_amount", e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <p className="text-xs font-medium text-neutral-500">{t("activeFilters")}</p>
                  {filters.q && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {filters.q}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearchInput(""); updateFilter("q", undefined); }} />
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("status", undefined)} />
                    </Badge>
                  )}
                  {filters.payment_method && (
                    <Badge variant="secondary" className="gap-1">
                      Method: {filters.payment_method}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("payment_method", undefined)} />
                    </Badge>
                  )}
                  {filters.paid_after && (
                    <Badge variant="secondary" className="gap-1">
                      After: {filters.paid_after}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("paid_after", undefined)} />
                    </Badge>
                  )}
                  {filters.paid_before && (
                    <Badge variant="secondary" className="gap-1">
                      Before: {filters.paid_before}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("paid_before", undefined)} />
                    </Badge>
                  )}
                  {(filters.min_amount || filters.max_amount) && (
                    <Badge variant="secondary" className="gap-1">
                      Amount: {filters.min_amount || 0} - {filters.max_amount || "∞"}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => { updateFilter("min_amount", undefined); updateFilter("max_amount", undefined); }} />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-sm rounded-xl">
        <CardHeader className="border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            {data?.meta && (
              <p className="text-sm text-neutral-500">
                Showing {((data.meta.current_page - 1) * (filters.per_page || 20)) + 1} - {Math.min(data.meta.current_page * (filters.per_page || 20), data.meta.total_count)} of {data.meta.total_count}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : data?.invoices.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Invoice</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Business</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Plan</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Payment</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-mono text-sm font-semibold text-neutral-900">{invoice.invoice_id}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">ID: {invoice.id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/admin/providers/${invoice.business_id}`} className="group">
                          <p className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                            {invoice.business_name}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">ID: {invoice.business_id}</p>
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        {invoice.plan_id ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {invoice.plan_id}
                          </Badge>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-bold text-neutral-900">
                            {formatPrice(invoice.total)}
                          </p>
                          <p className="text-xs text-neutral-400 uppercase mt-0.5">{invoice.currency}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-4 px-6">
                        {invoice.payment_method ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700 capitalize">{invoice.payment_method.replace("_", " ")}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {invoice.paid_at ? (
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              {format(new Date(invoice.paid_at), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {format(new Date(invoice.paid_at), "HH:mm")}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Not paid</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="sm" className="hover:bg-primary-50 hover:text-primary-700">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <FileText className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-medium mb-1">{t("noInvoicesFound")}</p>
              <p className="text-sm text-neutral-500">{t("tryAdjustingFilters")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {data?.meta && data.meta.total_pages > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.total_pages}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
        />
      )}
    </div>
  );
}
