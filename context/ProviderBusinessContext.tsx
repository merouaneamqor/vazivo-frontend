"use client";

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { Business } from "@/types";

interface ProviderBusinessContextValue {
  businesses: Business[];
  selectedBusinessId: number | undefined;
  setSelectedBusinessId: (id: number | undefined) => void;
  activeBusinessId: number | undefined;
  selectedBusiness: Business | undefined;
  isLoading: boolean;
}

const ProviderBusinessContext = createContext<ProviderBusinessContextValue | null>(null);

export function ProviderBusinessProvider({ children }: { children: ReactNode }) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  const { isAuthenticated } = useAuth();

  const { data: businessesData, isLoading } = useQuery({
    queryKey: queryKeys.provider.businesses,
    queryFn: () => api.getProviderBusinesses(),
    enabled: isAuthenticated,
  });

  const businesses = businessesData?.businesses ?? [];
  const firstBusiness = businesses[0];

  useEffect(() => {
    if (!selectedBusinessId && firstBusiness?.id) {
      setSelectedBusinessId(firstBusiness.id);
    }
  }, [selectedBusinessId, firstBusiness?.id]);

  const activeBusinessId = selectedBusinessId ?? firstBusiness?.id;
  const selectedBusiness = activeBusinessId
    ? businesses.find((b) => b.id === activeBusinessId) ?? firstBusiness
    : firstBusiness;

  const value = useMemo(
    () => ({
      businesses,
      selectedBusinessId: activeBusinessId,
      setSelectedBusinessId,
      activeBusinessId,
      selectedBusiness,
      isLoading,
    }),
    [businesses, activeBusinessId, selectedBusiness, isLoading]
  );

  return (
    <ProviderBusinessContext.Provider value={value}>
      {children}
    </ProviderBusinessContext.Provider>
  );
}

export function useProviderBusiness(): ProviderBusinessContextValue {
  const ctx = useContext(ProviderBusinessContext);
  if (!ctx) {
    throw new Error("useProviderBusiness must be used within ProviderBusinessProvider");
  }
  return ctx;
}

export function useProviderBusinessOptional(): ProviderBusinessContextValue | null {
  return useContext(ProviderBusinessContext);
}
