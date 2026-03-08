"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronRight,
  X,
  Star,
  RefreshCw,
  Filter,
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { AnimatedTabs } from "@/components/ui/tabs";
import { BookingCardSkeleton } from "@/components/ui/skeleton";
import { formatPrice, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

type BookingsFilter = "upcoming" | "past" | "all";

export default function BookingsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BookingsPageContent />
    </Suspense>
  );
}

function BookingsPageContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [filter, setFilter] = useState<BookingsFilter>("upcoming");

  const { data, isLoading, error, refetch } = useBookings({
    upcoming: filter === "upcoming" || undefined,
    past: filter === "past" || undefined,
  });

  const cancelBooking = useCancelBooking();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) return <PageSpinner />;

  // Handle various API response formats (including nested bookings.bookings)
  type BookingsPayload =
    | Booking[]
    | { bookings: Booking[] }
    | { bookings: { bookings: Booking[] } };
  const bookings: Booking[] = (() => {
    const d = data as BookingsPayload | undefined;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (typeof d === "object" && d !== null && "bookings" in d) {
      const b = (d as { bookings: Booking[] | { bookings: Booking[] } }).bookings;
      if (Array.isArray(b)) return b;
      if (b && typeof b === "object" && "bookings" in b && Array.isArray((b as { bookings: Booking[] }).bookings))
        return (b as { bookings: Booking[] }).bookings;
    }
    return [];
  })();

  // Sort bookings in a clear timeline from newest to oldest
  const sortedBookings = [...bookings].sort((a, b) => {
    const aDateTime = parseISO(`${a.date}T${(a.start_time as string) || "00:00"}`);
    const bDateTime = parseISO(`${b.date}T${(b.start_time as string) || "00:00"}`);
    return bDateTime.getTime() - aDateTime.getTime();
  });

  const tabs = [
    { id: "upcoming" as const, label: "Upcoming", icon: <Calendar className="h-4 w-4" /> },
    { id: "past" as const, label: "Past", icon: <Clock className="h-4 w-4" /> },
    { id: "all" as const, label: "All", icon: <Filter className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            My Bookings
          </h1>
          <p className="text-neutral-500">Manage your appointments</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="mb-6">
          <AnimatedTabs
            tabs={tabs}
            activeTab={filter}
            onChange={(id) => setFilter(id as BookingsFilter)}
            variant="pills"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500 mb-4">Failed to load bookings</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No {filter === "all" ? "" : filter} bookings
                </h3>
                <p className="text-neutral-500 mb-6">
                  {filter === "upcoming"
                    ? "Ready to treat yourself? Browse services and book your next appointment."
                    : "Your past appointments will appear here."}
                </p>
                <Link href="/search">
                  <Button>Browse Services</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative pl-5 sm:pl-7"
          >
            {/* Vertical timeline line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-neutral-200" aria-hidden />
            <div className="space-y-5 sm:space-y-6">
              {sortedBookings.map((booking, index) => (
                <div key={booking.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-0.5 mt-5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 shadow-sm" />
                  <BookingCard
                    booking={booking}
                    index={index}
                    onCancel={() => cancelBooking.mutate(booking.id)}
                    isCancelling={cancelBooking.isPending}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  index: number;
  onCancel: () => void;
  isCancelling: boolean;
}

function BookingCard({ booking, index, onCancel, isCancelling }: BookingCardProps) {
  const bookingDate = parseISO(booking.date);
  const isUpcoming = isAfter(bookingDate, new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-soft transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Date Column */}
            <div className="bg-primary-50 p-4 md:p-6 flex md:flex-col items-center justify-center md:w-28 gap-2 md:gap-0">
              <span className="text-sm text-primary-600 font-medium">
                {format(bookingDate, "EEE")}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-primary-700">
                {format(bookingDate, "d")}
              </span>
              <span className="text-sm text-primary-600">{format(bookingDate, "MMM")}</span>
            </div>

            {/* Details Column */}
            <div className="flex-1 p-4 md:p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-900">
                    {booking.service_name}
                  </h3>
                  <Link
                    href={`/business/${booking.business_slug || booking.business_id}`}
                    className="text-neutral-500 hover:text-primary-600 flex items-center text-sm"
                  >
                    {booking.business_name}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </span>
                {booking.total_price && (
                  <span className="font-medium text-neutral-900">
                    {formatPrice(booking.total_price)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {booking.can_cancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isCancelling}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}

                {booking.status === "completed" && !booking.review && (
                  <Link href={`/bookings/${booking.id}/review`}>
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </Link>
                )}

                {isUpcoming && booking.status !== "cancelled" && (
                  <Link href={`/business/${booking.business_slug || booking.business_id}`}>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                  </Link>
                )}

                <Link href={`/bookings/${booking.id}`}>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
