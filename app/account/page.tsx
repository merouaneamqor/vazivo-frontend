"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui/spinner";

/**
 * Account settings live in the Dashboard (Settings tab).
 * Redirect so /account and /dashboard are a single place.
 */
export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?tab=settings");
  }, [router]);

  return <PageSpinner />;
}
