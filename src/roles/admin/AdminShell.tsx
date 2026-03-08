/**
 * Admin Role Shell
 *
 * Composes the full admin portal chrome (sidebar + topbar + content area).
 * This is the role-level layout component; it delegates UI primitives to
 * the existing AdminSidebar and AdminTopbar components.
 *
 * App-layer layouts at app/admin/(dashboard)/layout.tsx import from here.
 * Moving presentation logic into src/roles/ keeps app/ thin.
 *
 * @module src/roles/admin/AdminShell
 */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

/* ── Sidebar segments used to derive the page title ─────────────────────── */

const SIDEBAR_SEGMENTS = [
  "dashboard",
  "bookings",
  "customers",
  "providers",
  "reviews",
  "claimRequests",
  "staff",
  "finance",
  "invoices",
  "reports",
  "categories",
  "plans",
  "cities",
  "settings",
  "support",
] as const;

/* ── Component ───────────────────────────────────────────────────────────── */

interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * AdminShell wraps every page inside the admin portal.
 * Auth is verified by the server layout before this mounts.
 */
export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");

  // Derive the current section key from the URL
  const rawSegment = pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
  const titleKey = rawSegment === "claim-requests" ? "claimRequests" : rawSegment;
  const isKnownSegment =
    (SIDEBAR_SEGMENTS as readonly string[]).includes(rawSegment) ||
    rawSegment === "claim-requests";
  const title = isKnownSegment ? t(titleKey as (typeof SIDEBAR_SEGMENTS)[number]) : rawSegment;

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-0">
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <AdminTopbar title={title} onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}
