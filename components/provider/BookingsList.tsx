"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { useConfirmBooking, useCancelBooking, useCompleteBooking } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingDetailsModal } from "@/components/provider/BookingDetailsModal";
import { formatPrice, formatTime } from "@/lib/utils";
import type { Booking, StaffMember } from "@/types";

export function BookingsList() {
  const t = useTranslations("providerBookings");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { businesses, activeBusinessId } = useProviderBusiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStaffId, setSelectedStaffId] = useState<number | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch staff for selected business
  const { data: staffData } = useQuery({
    queryKey: queryKeys.businesses.staff(activeBusinessId!),
    queryFn: () => api.getBusinessStaff(activeBusinessId!),
    enabled: !!activeBusinessId,
  });

  const staffMembers: StaffMember[] = staffData?.staff || [];

  // Set initial staff to current user
  useState(() => {
    if (!selectedStaffId && user?.id) {
      setSelectedStaffId(user.id);
    }
  });

  // Fetch bookings using provider API
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: queryKeys.provider.bookings({
      business_id: activeBusinessId,
      user_id: selectedStaffId,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    queryFn: () =>
      api.getProviderBookings({
        business_id: activeBusinessId,
        user_id: selectedStaffId,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    enabled: !!activeBusinessId,
  });

  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const completeBooking = useCompleteBooking();

  const invalidateBookings = () => {
    queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
    queryClient.invalidateQueries({ queryKey: ["provider", "calendar"] });
    setBookingModalOpen(false);
    setSelectedBooking(null);
  };

  const bookings = (() => {
    const raw = bookingsData as
      | Booking[]
      | { bookings: Booking[] | { bookings: Booking[] }; meta?: unknown }
      | undefined;
    let bookingsList: Booking[] = [];
    if (Array.isArray(raw)) {
      bookingsList = raw;
    } else if (raw && typeof raw === "object" && "bookings" in raw) {
      const b = raw.bookings;
      bookingsList = Array.isArray(b) ? b : Array.isArray(b?.bookings) ? b.bookings : [];
    }
    return bookingsList;
  })();

  // Handle booking query param from search
  useEffect(() => {
    const bookingId = searchParams.get("booking");
    if (bookingId && bookings.length > 0) {
      const booking = bookings.find((b) => b.id === Number(bookingId));
      if (booking) {
        setSelectedBooking(booking);
        setBookingModalOpen(true);
      }
    }
  }, [searchParams, bookings]);

  // Filter bookings by search query
  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.service_name?.toLowerCase().includes(query) ||
      booking.user?.name?.toLowerCase().includes(query) ||
      booking.user?.email?.toLowerCase().includes(query)
    );
  });

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingModalOpen(true);
  };

  return (
    <>
      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Staff selector */}
          <div className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200 lg:w-48">
            <Users className="h-4 w-4 text-neutral-500" />
            <Select
              value={selectedStaffId ? String(selectedStaffId) : "all"}
              onValueChange={(val) => setSelectedStaffId(val === "all" ? undefined : Number(val))}
            >
              <SelectTrigger className="border-0 bg-transparent h-8 focus:ring-0 p-0">
                <SelectValue placeholder={t("allStaff")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStaff")}</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={String(staff.id)}>
                    {staff.name}
                    {staff.id === user?.id && ` (${t("you")})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200 lg:w-40">
            <Filter className="h-4 w-4 text-neutral-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-0 bg-transparent h-8 focus:ring-0 p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="confirmed">{t("confirmed")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 bg-neutral-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-lg font-medium text-neutral-900 mb-2">{t("noBookings")}</p>
            <p className="text-sm text-neutral-500">
              {searchQuery
                ? t("tryAdjusting")
                : t("bookingsWillAppear")}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 hover:border-primary-200 hover:shadow-sm bg-white transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                      {booking.service_name}
                    </p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {booking.customer_name || booking.user?.name || "Customer"}
                    </span>
                    {(booking.customer_email || booking.user?.email) && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <span className="truncate">{booking.customer_email || booking.user?.email}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(parseISO(booking.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTime(booking.start_time)}</span>
                    </div>
                    {booking.staff && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <span>{booking.staff.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-lg font-bold text-neutral-900">
                    {formatPrice(booking.total_price ?? 0)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {booking.duration_minutes || 60} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={(booking) =>
          confirmBooking.mutate(booking.id, {
            onSuccess: invalidateBookings,
          })
        }
        onCancel={(booking) =>
          cancelBooking.mutate(booking.id, {
            onSuccess: invalidateBookings,
          })
        }
        onComplete={(booking) =>
          completeBooking.mutate(booking.id, {
            onSuccess: invalidateBookings,
          })
        }
        isConfirming={confirmBooking.isPending}
        isCancelling={cancelBooking.isPending}
        isCompleting={completeBooking.isPending}
      />
    </>
  );
}
