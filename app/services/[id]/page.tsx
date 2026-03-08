"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Legacy route: redirect to booking flow at /book/[id].
 */
export default function ServicesIdRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (id) router.replace(`/book/${id}`);
  }, [id, router]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-neutral-500">Redirecting to booking…</p>
    </div>
  );
}
