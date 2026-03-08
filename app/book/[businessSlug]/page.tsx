"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "@/lib/api";
import { toServiceSlug } from "@/lib/utils";
import { PageSpinner } from "@/components/ui/spinner";

/**
 * /book/[businessSlug] — one segment.
 * - If numeric: legacy service id → fetch service and redirect to /book/businessSlug/serviceSlug.
 * - Otherwise: business slug only → redirect to business page to pick a service.
 */
export default function BookByBusinessSlugPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.businessSlug as string;
  const id = parseInt(businessSlug, 10);
  const isLegacyId = /^\d+$/.test(businessSlug) && !Number.isNaN(id);

  useEffect(() => {
    if (!businessSlug) {
      router.replace("/search");
      return;
    }

    if (isLegacyId) {
      let cancelled = false;
      api
        .getPublicService(id)
        .then((data: { service?: { business?: { slug?: string }; slug?: string; name?: string } }) => {
          if (cancelled) return;
          const service = data?.service ?? data;
          const business = service?.business;
          const bSlug = business?.slug;
          const serviceSlug = service?.slug ?? toServiceSlug(service?.name);
          if (bSlug && serviceSlug) {
            router.replace(`/book/${bSlug}/${serviceSlug}`);
          } else {
            router.replace("/search");
          }
        })
        .catch(() => {
          if (!cancelled) router.replace("/search");
        });
      return () => {
        cancelled = true;
      };
    }

    router.replace(`/business/${businessSlug}`);
  }, [businessSlug, isLegacyId, id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <PageSpinner />
    </div>
  );
}
