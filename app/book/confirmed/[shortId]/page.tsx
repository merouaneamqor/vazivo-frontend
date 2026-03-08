"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  UserPlus,
  AlertCircle,
  Copy,
  CalendarPlus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { formatPrice, formatTime } from "@/lib/utils";
import toast from "react-hot-toast";
import type { BookingConfirmation } from "@/types";

export default function BookConfirmedPage() {
  const params = useParams();
  const shortId = params.shortId as string;
  const { isAuthenticated } = useAuth();

  const { data: confirmation, isLoading, error } = useQuery({
    queryKey: ["booking-confirmation", shortId],
    queryFn: () => api.getBookingConfirmation(shortId),
    enabled: !!shortId,
  });

  if (isLoading || !shortId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <PageSpinner />
      </div>
    );
  }

  if (error || !confirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-neutral-400" />
          </div>
          <h1 className="text-xl font-display font-bold text-neutral-900 mb-2">Booking not found</h1>
          <p className="text-neutral-600 mb-6">
            This link may be invalid or the booking may have been removed.
          </p>
          <Link href="/search">
            <Button variant="outline" className="w-full sm:w-auto">
              Find services
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const booking = confirmation as BookingConfirmation;
  const bookingDate = parseISO(booking.date);
  const startIso = `${format(bookingDate, "yyyyMMdd")}T${booking.start_time.replace(":", "")}00`;
  const endIso = `${format(bookingDate, "yyyyMMdd")}T${booking.end_time.replace(":", "")}00`;
  const addToCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.service_name)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(booking.business_name)}`;

  const copyReference = () => {
    navigator.clipboard.writeText(booking.short_booking_id);
    toast.success("Reference copied");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white pb-20">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Success hero */}
          <div className="text-center pt-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-500 text-white shadow-lg shadow-success-500/25 mb-6"
            >
              <CheckCircle className="h-10 w-10" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-900 tracking-tight">
              You&apos;re all set
            </h1>
            <p className="text-neutral-600 mt-2 max-w-sm mx-auto">
              Your appointment is confirmed. Details have been sent to your phone and email.
            </p>
          </div>

          {/* Booking card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
          >
            <div className="p-6 space-y-5">
              <div>
                <h2 className="font-display font-semibold text-lg text-neutral-900">
                  {booking.service_name}
                </h2>
                <p className="text-neutral-500 text-sm mt-0.5">{booking.business_name}</p>
              </div>

              <div className="flex items-center gap-3 text-neutral-700">
                <div className="flex-shrink-0 w-10 h-10  bg-primary-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {format(bookingDate, "EEEE, MMMM d")}
                  </p>
                  <p className="text-sm text-neutral-500">{format(bookingDate, "yyyy")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-700">
                <div className="flex-shrink-0 w-10 h-10  bg-primary-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary-600" />
                </div>
                <p className="font-medium">
                  {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                  <span className="text-neutral-500 font-normal ml-1">
                    ({booking.duration_minutes} min)
                  </span>
                </p>
              </div>

              {booking.business_slug && (
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10  bg-neutral-50 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-neutral-500" />
                  </div>
                  <Link
                    href={`/business/${booking.business_slug}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View business & directions
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">Reference</span>
                  <button
                    type="button"
                    onClick={copyReference}
                    className="font-mono font-semibold text-neutral-900 hover:text-primary-600 flex items-center gap-1.5 transition-colors"
                    title="Copy"
                  >
                    #{booking.short_booking_id}
                    <Copy className="h-3.5 w-3.5 text-neutral-400" />
                  </button>
                </div>
                {booking.total_price != null && booking.total_price > 0 && (
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(booking.total_price)}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50/80 flex flex-col sm:flex-row gap-2">
              <a
                href={addToCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
              >
                <CalendarPlus className="h-4 w-4" />
                Add to calendar
              </a>
            </div>
          </motion.div>

          {/* Create account CTA – guests only */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-primary-100 p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12  bg-primary-100 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900 mb-1">Create an account</h2>
                  <p className="text-sm text-neutral-600 mb-4">
                    Manage bookings, get reminders, and save favorites.
                  </p>
                  <Link
                    href={
                      booking.customer_name
                        ? `/register?name=${encodeURIComponent(booking.customer_name)}`
                        : "/register"
                    }
                  >
                    <Button size="lg" className="w-full sm:w-auto">
                      Sign up free
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/search" className="order-2 sm:order-1">
              <Button variant="outline" className="w-full sm:w-auto" size="lg">
                Find more services
              </Button>
            </Link>
            <Link href="/" className="order-1 sm:order-2">
              <Button variant="ghost" className="w-full sm:w-auto" size="lg">
                Back to home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
