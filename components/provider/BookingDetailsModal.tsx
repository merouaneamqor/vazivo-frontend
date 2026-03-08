"use client";

import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Users, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/modal";
import { formatPrice, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

interface BookingDetailsModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onConfirm?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onComplete?: (booking: Booking) => void;
  isConfirming?: boolean;
  isCancelling?: boolean;
  isCompleting?: boolean;
}

export function BookingDetailsModal({
  booking,
  open,
  onClose,
  onConfirm,
  onCancel,
  onComplete,
  isConfirming,
  isCancelling,
  isCompleting,
}: BookingDetailsModalProps) {
  const t = useTranslations("bookingDetails");

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="md" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Service Info */}
          <div className="rounded-xl bg-neutral-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-neutral-900">{booking.service_name}</p>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-neutral-500">
              {formatPrice(booking.total_price ?? 0)} • {booking.duration_minutes || 60} {t("min")}
            </p>
          </div>

          {/* Date & Time */}
          <div className="space-y-2 rounded-xl bg-white border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-900">{format(parseISO(booking.date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-900">{formatTime(booking.start_time)}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 rounded-xl bg-white border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-900">
                {booking.customer_name || booking.user?.name || t("customer")}
              </span>
            </div>
            {(booking.customer_email || booking.user?.email) && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-600">{booking.customer_email || booking.user?.email}</span>
              </div>
            )}
            {(booking.customer_phone || booking.user?.phone) && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-neutral-500" />
                <span className="text-neutral-600">{booking.customer_phone || booking.user?.phone}</span>
              </div>
            )}
          </div>

          {/* Staff */}
          {booking.staff && (
            <div className="flex items-center gap-2 text-sm rounded-xl bg-white border border-neutral-200 p-4">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-neutral-900">{booking.staff.name}</span>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-sm text-amber-900">{booking.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {booking.status === "pending" && onConfirm && (
            <Button onClick={() => onConfirm(booking)} loading={isConfirming} className="flex-1">
              {t("confirm")}
            </Button>
          )}
          {booking.status === "confirmed" && onComplete && (
            <Button onClick={() => onComplete(booking)} loading={isCompleting} className="flex-1">
              {t("complete")}
            </Button>
          )}
          {(booking.status === "pending" || booking.status === "confirmed") && onCancel && (
            <Button
              onClick={() => onCancel(booking)}
              loading={isCancelling}
              variant="outline"
              className="flex-1"
            >
              {t("cancel")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
