"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/admin";

const statusConfig: Record<
  VerificationStatus | "suspended",
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  verified: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export function VerificationBadge({
  status,
  className,
}: {
  status: VerificationStatus | "suspended" | string;
  className?: string;
}) {
  const key = status in statusConfig ? (status as keyof typeof statusConfig) : "pending";
  const config = statusConfig[key] ?? statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  );
}
