"use client";

import { format, parseISO } from "date-fns";
import { Calendar, CheckCircle, Users, XCircle, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatPrice, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onComplete: (id: number) => void;
  isLoading: boolean;
}

export function BookingDetailDrawer({
  open,
  onOpenChange,
  booking,
  onConfirm,
  onCancel,
  onComplete,
  isLoading,
}: BookingDetailDrawerProps) {
  if (!booking) return null;

  const hasMultipleServices = booking.booking_services && booking.booking_services.length > 0;
  const services = hasMultipleServices ? booking.booking_services : [{
    service_name: booking.service_name,
    staff_name: booking.staff?.name,
    price: booking.total_price,
    duration_minutes: booking.duration_minutes
  }];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-2 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold leading-tight mb-2">
                Booking Details
              </SheetTitle>
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-3 py-3">
          {/* Services List */}
          <div className="space-y-2">
            {(services ?? []).map((service, index) => (
              <div key={index} className="p-3 bg-primary-50 rounded-xl border border-primary-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-primary-900">{service.service_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-primary-700">
                      <span>{formatPrice(service.price || 0)}</span>
                      <span>•</span>
                      <span>{service.duration_minutes || 60} min</span>
                      {service.staff_name && (
                        <>
                          <span>•</span>
                          <span>{service.staff_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-base bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
            <Calendar className="h-5 w-5 text-neutral-600" />
            <span className="font-semibold text-neutral-900">
              {format(parseISO(booking.date), "MMM d, yyyy")}
            </span>
            <span className="text-neutral-400">•</span>
            <Clock className="h-5 w-5 text-neutral-600" />
            <span className="font-semibold text-neutral-900">{formatTime(booking.start_time)}</span>
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <Users className="h-5 w-5 text-neutral-500" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900">
                {booking.customer_name || booking.user?.name || "Guest"}
              </p>
              <div className="flex gap-3 text-sm text-neutral-600 mt-0.5">
                {(booking.customer_email || booking.user?.email) && (
                  <span className="truncate">{booking.customer_email || booking.user?.email}</span>
                )}
                {booking.customer_phone && (
                  <span>{booking.customer_phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="p-3 bg-primary-50 rounded-xl border border-primary-200 text-center">
            <p className="text-2xl font-bold text-primary-900">
              {formatPrice(booking.total_price ?? 0)}
            </p>
            <p className="text-xs text-primary-700 mt-1">Total</p>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                Notes
              </p>
              <p className="text-sm text-amber-900 italic">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
          {booking.can_confirm && (
            <Button
              onClick={() => onConfirm(booking.id)}
              disabled={isLoading}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Booking
            </Button>
          )}
          {booking.can_complete && (
            <Button
              onClick={() => onComplete(booking.id)}
              disabled={isLoading}
              className="w-full"
            >
              Mark as Completed
            </Button>
          )}
          {booking.can_cancel && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => onCancel(booking.id)}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
