"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import toast from "react-hot-toast";
import type { Business } from "@/types";

interface BusinessFilters {
  q?: string;
  category?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  page?: number;
  per_page?: number;
  sort_by?: string;
}

export function useBusinesses(filters: BusinessFilters = {}) {
  return useQuery({
    queryKey: queryKeys.businesses.list(filters as Record<string, unknown>),
    queryFn: () => api.getBusinesses(filters),
  });
}

export function useBusiness(id: number) {
  return useQuery({
    queryKey: queryKeys.businesses.detail(id),
    queryFn: () => api.getBusinessById(id),
    enabled: !!id,
  });
}

export function useBusinessStats(id: number) {
  return useQuery({
    queryKey: queryKeys.businesses.stats(id),
    queryFn: () => api.getBusinessStats(id),
    enabled: !!id,
  });
}

export function useBusinessBookings(id: number, filters?: { start_date?: string; end_date?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.businesses.bookings(id, filters),
    queryFn: () => api.getBusinessBookings(id, filters),
    enabled: !!id,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Business>) => api.createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      toast.success("Business created successfully!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create business");
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Business> }) =>
      api.updateBusiness(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      toast.success("Business updated successfully!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update business");
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
      toast.success("Business deleted successfully!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete business");
    },
  });
}
