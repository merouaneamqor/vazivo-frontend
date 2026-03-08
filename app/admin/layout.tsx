/**
 * Admin Root Layout
 *
 * Provides shared styling and providers for all admin routes.
 * Authentication is handled at different levels:
 * - proxy.ts: Edge protection (fast, first line)
 * - (dashboard)/layout.tsx: Server-side guard (RSC, defense in depth)
 * - Client guards: UX polish during navigation
 *
 * Note: /admin/login is outside (dashboard) route group, so it's accessible.
 */

import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex flex-1 flex-col min-h-0 bg-neutral-50">{children}</div>
    </QueryProvider>
  );
}
