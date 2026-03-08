/**
 * Admin Dashboard Layout (Protected)
 *
 * Server component that:
 * 1. Verifies admin session on the server (defense in depth)
 * 2. Renders the admin chrome (sidebar, topbar)
 *
 * This layout wraps all protected admin pages in the (dashboard) route group.
 */

import { requireAdmin } from "@/lib/auth/dal";
import { AdminDashboardShell } from "./AdminDashboardShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth verification - redirects if not admin
  await requireAdmin();

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
