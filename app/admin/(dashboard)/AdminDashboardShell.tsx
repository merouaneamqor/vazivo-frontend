"use client";

/**
 * Admin Dashboard Shell (Client Component)
 *
 * Renders the admin UI chrome: sidebar, topbar, and main content area.
 * Authentication is already verified by the server layout.
 */

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

const sidebarSegments = [
  "dashboard",
  "bookings",
  "customers",
  "providers",
  "reviews",
  "claimRequests",
  "staff",
  "finance",
  "reports",
  "categories",
  "cities",
  "seo-pages",
  "settings",
  "support",
];

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
  const titleKey = segment === "claim-requests" ? "claimRequests" : segment === "seo-pages" ? "seoPages" : segment;
  const title = sidebarSegments.includes(segment) || segment === "claim-requests" ? t(titleKey) : segment;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-0">
      <AdminSidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <AdminTopbar title={title} onMenuClick={() => setIsMobileOpen(true)} />
        <div className="flex-1 p-4 md:p-6 overflow-auto bg-neutral-50">
          {children}
        </div>
      </div>
    </div>
  );
}
