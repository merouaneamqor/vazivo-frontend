/**
 * User Dashboard Layout (Protected)
 *
 * Server component that verifies user is authenticated.
 * Provides defense in depth alongside proxy.ts edge protection.
 * QueryProvider is provided by the root layout; do not duplicate here to avoid Turbopack client/server boundary issues.
 * Suspense boundary for client children that use useSearchParams (required for static export / Turbopack).
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { verifySession } from "@/lib/auth/dal";
import { PageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  return (
    <Suspense fallback={<PageSpinner />}>
      {children}
    </Suspense>
  );
}
