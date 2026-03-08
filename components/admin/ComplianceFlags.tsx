"use client";

import { AlertTriangle, UserX, Copy, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminProviderListItem } from "@/types/admin";

type ComplianceFlagKey =
  | "suspicious_rating_pattern"
  | "high_no_show"
  | "high_refund_rate"
  | "duplicate_listing"
  | "banned_user_linked"
  | "missing_documents";

const flags: {
  key: ComplianceFlagKey;
  icon: typeof AlertTriangle;
  label: string;
}[] = [
  { key: "suspicious_rating_pattern", icon: AlertTriangle, label: "Suspicious rating pattern" },
  { key: "high_no_show", icon: AlertTriangle, label: "High no-show rate" },
  { key: "high_refund_rate", icon: AlertTriangle, label: "High refund rate" },
  { key: "duplicate_listing", icon: Copy, label: "Possible duplicate listing" },
  { key: "banned_user_linked", icon: UserX, label: "Banned user linked" },
  { key: "missing_documents", icon: FileQuestion, label: "Missing documents" },
];

export function ComplianceFlags({
  provider,
  className,
}: {
  provider: Pick<
    AdminProviderListItem,
    | "suspicious_rating_pattern"
    | "high_no_show"
    | "high_refund_rate"
    | "duplicate_listing"
    | "banned_user_linked"
    | "missing_documents"
  >;
  className?: string;
}) {
  const active = flags.filter((f) => provider[f.key]);

  if (active.length === 0) {
    return <span className={cn("text-neutral-400 text-xs", className)}>—</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {active.map(({ key, icon: Icon, label }) => (
        <span key={key} title={label} className="text-amber-600">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ))}
    </span>
  );
}
