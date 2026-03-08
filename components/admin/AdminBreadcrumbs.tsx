"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const segmentKeys: Record<string, string> = {
  dashboard: "dashboard",
  customers: "customers",
  providers: "providers",
  bookings: "bookings",
  reviews: "reviews",
  "claim-requests": "claimRequests",
  finance: "finance",
  categories: "categories",
  cities: "cities",
  settings: "settings",
  staff: "staff",
  reports: "reports",
  support: "support",
  login: "login",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
      <Link href="/admin/dashboard" className="hover:text-neutral-700">
        {t("navLabel")}
      </Link>
      {segments.map((seg, i) => {
        const href = "/admin/" + segments.slice(0, i + 1).join("/");
        const label = segmentKeys[seg] ? t(`breadcrumbs.${segmentKeys[seg]}`) : seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            {isLast ? (
              <span className="text-neutral-900 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-neutral-700">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
