"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Clock,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  Star,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useCancelBooking } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDuration, formatTime } from "@/lib/utils";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const bookingId = Number(params.id);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => api.getBooking(bookingId),
    enabled: !!bookingId && isAuthenticated,
  });

  const cancelBooking = useCancelBooking();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading || !isAuthenticated) return <PageSpinner />;

  if (error || !data?.booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">Booking not found</p>
        <Link href="/bookings">
          <Button variant="outline">View All Bookings</Button>
        </Link>
      </div>
    );
  }

  const booking = data.booking;
  const bookingDate = parseISO(booking.date);

  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-amber-500", bgColor: "bg-amber-50" },
    confirmed: { icon: CheckCircle, color: "text-success-500", bgColor: "bg-success-50" },
    cancelled: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-50" },
    completed: { icon: CheckCircle, color: "text-neutral-500", bgColor: "bg-neutral-50" },
    no_show: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-50" },
  };

  const config = statusConfig[booking.status];
  const StatusIcon = config.icon;

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    cancelBooking.mutate(bookingId);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/bookings"
            className="inline-flex items-center text-neutral-600 hover:text-primary-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            All Bookings
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={` p-6 ${config.bgColor}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-white ${config.color}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">
                Booking {booking.status === "confirmed" ? "Confirmed" : booking.status}
              </p>
              <p className="text-sm text-neutral-600">
                {booking.status === "pending" && "Waiting for confirmation from the business"}
                {booking.status === "confirmed" && "Your appointment is confirmed"}
                {booking.status === "cancelled" && `Cancelled on ${booking.cancelled_at ? format(parseISO(booking.cancelled_at), "MMM d, yyyy") : ""}`}
                {booking.status === "completed" && "This appointment has been completed"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{booking.service_name}</CardTitle>
                <StatusBadge status={booking.status} />
              </div>
              <Link
                href={`/business/${booking.business_slug || booking.business_id}`}
                className="text-primary-600 hover:text-primary-700 text-sm inline-flex items-center"
              >
                {booking.business_name}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-neutral-600">
                  <Calendar className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900">
                      {format(bookingDate, "EEEE")}
                    </p>
                    <p className="text-sm">{format(bookingDate, "MMMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <Clock className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900">
                      {formatTime(booking.start_time)}
                    </p>
                    <p className="text-sm">{formatDuration(booking.duration_minutes)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Total Price</span>
                <span className="text-xl font-bold text-neutral-900">
                  {booking.total_price ? formatPrice(booking.total_price) : "—"}
                </span>
              </div>

              {booking.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Notes</p>
                    <p className="text-neutral-900">{booking.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-neutral-600">
                <MapPin className="h-5 w-5 text-neutral-400" />
                <span>{booking.business_name}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {booking.can_cancel && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleCancel}
              loading={cancelBooking.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          )}

          {booking.status === "completed" && !booking.review && (
            <Link href={`/bookings/${booking.id}/review`}>
              <Button className="w-full">
                <Star className="h-4 w-4 mr-2" />
                Leave a Review
              </Button>
            </Link>
          )}

          <Link href={`/business/${booking.business_slug || booking.business_id}`}>
            <Button variant="outline" className="w-full">
              Book Again
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
