"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, Filter, X, Calendar, User, Building2, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAdminBookings } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { AdminBookingListItem } from "@/types/admin";

const DEBOUNCE_MS = 300;

interface BookingFilters {
  page?: number;
  per_page?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  q?: string;
}

export default function AdminBookingsPage() {
  const t = useTranslations("adminBookings");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<BookingFilters>({ page: 1, per_page: 20 });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useAdminBookings(filters as any);

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

  const updateFilter = (key: keyof BookingFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ page: 1, per_page: 20 });
    setSearchInput("");
  };

  const hasActiveFilters = 
    filters.status || 
    filters.payment_status || 
    filters.date_from || 
    filters.date_to ||
    filters.q;

  const activeFilterCount = [
    filters.status,
    filters.payment_status,
    filters.date_from,
    filters.date_to,
    filters.q,
  ].filter(Boolean).length;

  // Calculate stats
  const stats = data?.bookings ? {
    total: data.bookings.length,
    pending: data.bookings.filter(b => b.status === 'pending').length,
    confirmed: data.bookings.filter(b => b.status === 'confirmed').length,
    completed: data.bookings.filter(b => b.status === 'completed').length,
    cancelled: data.bookings.filter(b => b.status === 'cancelled').length,
  } : null;

  return (
    <div className="space-y-4 p-3 md:p-4">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">{t("subtitle")}</p>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="rounded-xl rounded-xl cursor-pointer hover:shadow-md transition-shadow" onClick={() => updateFilter('status', undefined)}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-xl font-bold text-neutral-900">{data?.meta?.total_count || 0}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Total Bookings</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl rounded-xl cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-yellow-500" onClick={() => updateFilter('status', 'pending')}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Pending</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl rounded-xl cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500" onClick={() => updateFilter('status', 'confirmed')}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-xl font-bold text-blue-600">{stats.confirmed}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Confirmed</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl rounded-xl cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500" onClick={() => updateFilter('status', 'completed')}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Completed</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl rounded-xl cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-red-500" onClick={() => updateFilter('status', 'cancelled')}>
            <CardContent className="p-3 md:p-4">
              <div className="text-lg md:text-xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Cancelled</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white border border-neutral-200  shadow-sm">
        <div className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search by customer, provider, or service..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10  border-neutral-200"
              />
            </div>

            <select
              value={filters.status || ""}
              onChange={(e) => updateFilter("status", e.target.value || undefined)}
              className=" border border-neutral-200 px-4 py-2 text-sm min-w-[140px] bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">⏱ Pending</option>
              <option value="confirmed">✓ Confirmed</option>
              <option value="completed">✓ Completed</option>
              <option value="cancelled">✗ Cancelled</option>
            </select>

            <select
              value={filters.payment_status || ""}
              onChange={(e) => updateFilter("payment_status", e.target.value || undefined)}
              className=" border border-neutral-200 px-4 py-2 text-sm min-w-[140px] bg-white"
            >
              <option value="">All Payments</option>
              <option value="pending">⏱ Pending</option>
              <option value="succeeded">✓ Paid</option>
              <option value="failed">✗ Failed</option>
              <option value="refunded">↩ Refunded</option>
            </select>

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              More
              {activeFilterCount > 2 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFilterCount - 2}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 mb-2">
                  <Calendar className="h-3 w-3" />
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.date_from || ""}
                  onChange={(e) => updateFilter("date_from", e.target.value || undefined)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 mb-2">
                  <Calendar className="h-3 w-3" />
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.date_to || ""}
                  onChange={(e) => updateFilter("date_to", e.target.value || undefined)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <CardTitle>Bookings</CardTitle>
            {data?.meta && (
              <p className="text-sm text-neutral-500">
                Showing {((data.meta.current_page - 1) * (filters.per_page || 20)) + 1} - {Math.min(data.meta.current_page * (filters.per_page || 20), data.meta.total_count)} of {data.meta.total_count}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-3 md:p-3 md:p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : data?.bookings.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Booking</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Provider</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Service</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Payment</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-semibold text-neutral-900">#{booking.id}</span>
                          <span className="text-xs text-neutral-400">
                            {booking.created_at && format(new Date(booking.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-900">{booking.customer_name}</span>
                            <span className="text-xs text-neutral-500">ID: {booking.user_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <Link href={`/admin/providers/${booking.business_id}`} className="font-medium text-primary-600 hover:underline">
                              {booking.business_name}
                            </Link>
                            <span className="text-xs text-neutral-500">ID: {booking.business_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-neutral-700">{booking.service_name || "—"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm font-medium text-neutral-900">
                            <Calendar className="h-3 w-3 text-neutral-400" />
                            {booking.date && format(new Date(booking.date), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <Clock className="h-3 w-3" />
                            {booking.start_time} - {booking.end_time}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="py-4 px-6">
                        {booking.payment_status ? (
                          <StatusBadge status={booking.payment_status} />
                        ) : (
                          <span className="text-sm text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm" className="hover:bg-primary-50 hover:text-primary-700">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <Calendar className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-medium mb-1">No bookings found</p>
              <p className="text-sm text-neutral-500">Try adjusting your filters</p>
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
