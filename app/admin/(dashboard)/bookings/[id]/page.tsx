"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  useAdminBooking,
  adminService,
} from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";

export default function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("adminBookingDetail");
  const tCommon = useTranslations("common");
  const bookingId = Number(id);
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(false);

  const { data, isLoading, error } = useAdminBooking(bookingId);

  const cancelBooking = useMutation({
    mutationFn: () => adminService.cancelBooking(bookingId),
    onSuccess: () => {
      setConfirmCancel(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.booking(bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookings() });
    },
  });

  const refundBooking = useMutation({
    mutationFn: () => adminService.refundBooking(bookingId),
    onSuccess: () => {
      setConfirmRefund(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.booking(bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookings() });
    },
  });

  if (Number.isNaN(bookingId) || error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">{t("notFound")}</p>
        <Link href="/admin/bookings">
          <Button variant="outline">{t("backToBookings")}</Button>
        </Link>
      </div>
    );
  }

  const booking = data?.booking;
  if (isLoading || !booking) {
    return (
      <div className="space-y-6">
        <p>{tCommon("loading")}</p>
      </div>
    );
  }

  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const hasPayment = !!data?.payment;
  const canRefund = hasPayment && data?.payment?.status !== "refunded";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          {t("title", { id: booking.id })}
        </h1>
        <StatusBadge status={booking.status} />
        <div className="flex gap-2 ml-auto">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmCancel(true)}
              disabled={cancelBooking.isPending}
            >
              {t("cancelBooking")}
            </Button>
          )}
          {canRefund && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRefund(true)}
              disabled={refundBooking.isPending}
            >
              {t("refundPayment")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-neutral-500">{t("date")}:</span> {booking.date}</p>
          <p><span className="text-neutral-500">{t("time")}:</span> {booking.start_time} – {booking.end_time}</p>
          <p><span className="text-neutral-500">{t("customer")}:</span> {booking.customer_name ?? data?.customer?.name ?? "—"}</p>
          <p><span className="text-neutral-500">{t("provider")}:</span> {data?.provider?.name ?? booking.business_name ?? "—"}</p>
          <p><span className="text-neutral-500">{t("service")}:</span> {data?.service?.name ?? booking.service_name ?? "—"}</p>
          <p><span className="text-neutral-500">{t("total")}:</span> ${booking.total_price ?? "—"}</p>
          <p><span className="text-neutral-500">{t("payment")}:</span> {data?.payment?.status ?? "—"}</p>
        </CardContent>
      </Card>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent size="sm" showClose={true}>
          <DialogHeader>
            <DialogTitle>{t("confirmCancelTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">{t("confirmCancelDescription")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>{tCommon("no")}</Button>
            <Button
              variant="destructive"
              onClick={() => cancelBooking.mutate()}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? t("cancelling") : t("yesCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmRefund} onOpenChange={setConfirmRefund}>
        <DialogContent size="sm" showClose={true}>
          <DialogHeader>
            <DialogTitle>{t("confirmRefundTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">{t("confirmRefundDescription")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRefund(false)}>{tCommon("no")}</Button>
            <Button
              variant="destructive"
              onClick={() => refundBooking.mutate()}
              disabled={refundBooking.isPending}
            >
              {refundBooking.isPending ? t("processing") : t("yesRefund")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
