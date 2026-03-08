"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";

export interface City {
  name: string;
  slug: string;
  business_count: number;
  /** Map center when searching by this city (from backend) */
  lat?: number;
  lng?: number;
}

interface Category {
  name: string;
  slug: string;
  business_count: number;
}

interface SearchFilters {
  cities: City[];
  categories: Category[];
  price_range: {
    min: number;
    max: number;
  };
}

// Hook to fetch all filters at once (cities, categories, price range)
export function useSearchFilters() {
  const locale = useLocale();
  return useQuery<SearchFilters>({
    queryKey: queryKeys.searchMetadata.filters(locale),
    queryFn: async () => {
      const data = await api.getFilters();
      return data as SearchFilters;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - filters don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
}

// Hook to fetch cities only
export function useCities() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.searchMetadata.cities(locale),
    queryFn: async () => {
      const data = await api.getCities();
      return data.cities;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
}

// Hook to fetch categories only
export function useCategories() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.searchMetadata.categories(locale),
    queryFn: async () => {
      const data = await api.getCategories();
      return data.categories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
}

