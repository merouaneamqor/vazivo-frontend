"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { BusinessPageContent } from "./BusinessPageContent";
import BusinessLoading from "./loading";
import BusinessNotFound from "./not-found";
import type { Business } from "@/types";

interface BusinessPageClientProps {
  slug: string;
  initialData: Business | null;
}

export function BusinessPageClient({ slug, initialData }: BusinessPageClientProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.businesses.detail(slug),
    queryFn: () => api.getBusiness(slug),
    initialData: initialData ? { business: initialData } : undefined,
    enabled: !!slug,
    retry: 1,
    staleTime: 60 * 1000,
  });

  // Use server data when available; only require fresh fetch when we had no server data
  const business = data?.business ?? initialData ?? null;

  if (isLoading && !business) {
    return <BusinessLoading />;
  }

  if (!business) {
    return <BusinessNotFound />;
  }

  return <BusinessPageContent slug={business.slug} initialData={business} />;
}
