"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageSpinner } from "@/components/ui/spinner";

/** Redirect legacy /booking/confirmation/[shortId] to /book/confirmed/[shortId]. */
export default function LegacyBookingConfirmationRedirect() {
  const params = useParams();
  const router = useRouter();
  const shortId = params.shortId as string;

  useEffect(() => {
    if (shortId) router.replace(`/book/confirmed/${shortId}`);
  }, [shortId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <PageSpinner />
    </div>
  );
}
