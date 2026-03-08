"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Status = "active" | "suspended" | "pending" | "paid" | "approved" | "rejected" | "confirmed" | "cancelled" | "completed" | "refunded" | "succeeded" | "failed";

const statusStyles: Record<Status, string> = {
  active: "bg-success-50 text-success-700",
  suspended: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-success-50 text-success-700",
  approved: "bg-success-50 text-success-700",
  rejected: "bg-red-50 text-red-700",
  confirmed: "bg-primary-50 text-primary-700",
  cancelled: "bg-neutral-100 text-neutral-600",
  completed: "bg-success-50 text-success-700",
  refunded: "bg-neutral-100 text-neutral-600",
  succeeded: "bg-success-50 text-success-700",
  failed: "bg-red-50 text-red-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const t = useTranslations("common.status");
  if (!status) return null;
  const normalized = status.toLowerCase() as Status;
  const style = statusStyles[normalized] ?? "bg-neutral-100 text-neutral-600";
  const label = ["pending", "paid", "confirmed", "cancelled", "completed", "refunded", "approved", "rejected", "active", "suspended", "succeeded", "failed"].includes(normalized)
    ? t(normalized)
    : status;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
