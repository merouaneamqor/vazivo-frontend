"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Redirect legacy /service/[id] to /book/[id]. */
export default function LegacyServiceRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) router.replace(`/book/${id}`);
  }, [id, router]);

  return null;
}
