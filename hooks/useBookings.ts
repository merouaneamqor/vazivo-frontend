"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

interface BookingFilters {
  status?: string;
  upcoming?: boolean;
  past?: boolean;
  page?: number;
}

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.bookings.list(filters as Record<string, unknown>),
    queryFn: () => api.getBookings(filters),
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => api.getBooking(id),
    enabled: !!id,
  });
}

export interface CreateBookingPayload {
  service_id?: number;
  date: string;
  start_time: string;
  end_time?: string;
  notes?: string;
  staff_id?: number;
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
  /** When set, backend fills customer_* from this Client. */
  client_id?: number;
  skip_business_hours_check?: boolean;
  /** Multi-service: one booking with multiple line items. When present, service_id is ignored. */
  services?: Array<{ service_id: number; staff_id?: number; price?: number; duration_minutes?: number }>;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingPayload) => api.createBooking(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({
        predicate: (query) => (query.queryKey as unknown[])[1] === "clients",
      });
      const booking = data && typeof data === "object" && "booking" in data ? (data as { booking: { business_slug?: string; service_id?: number; date?: string } }).booking : (data as { business_slug?: string; service_id?: number; date?: string } | null);
      const slug = booking?.business_slug;
      if (slug) {
        queryClient.invalidateQueries({
          queryKey: ["public", "businesses", slug, "availability"],
        });
      }
      const serviceId = booking?.service_id;
      const dateRaw = booking?.date;
      if (serviceId != null && dateRaw) {
        const dateString = typeof dateRaw === "string" ? dateRaw : undefined;
        if (dateString) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.services.availability(serviceId, dateString),
          });
        }
      }
      toast.success("Booking created successfully!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create booking");
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; date?: string; start_time?: string; notes?: string; skip_availability_check?: boolean }) =>
      api.updateBooking(data.id, {
        date: data.date,
        start_time: data.start_time,
        notes: data.notes,
        skip_availability_check: data.skip_availability_check,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: ["provider", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["provider", "bookings"] });
      toast.success("Booking rescheduled");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to reschedule booking");
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.confirmBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      toast.success("Booking confirmed!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to confirm booking");
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.cancelBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      // Refresh availability on business cards so the freed slot appears again
      queryClient.invalidateQueries({
        predicate: (query) => {
          const k = query.queryKey as unknown[];
          return (
            Array.isArray(k) &&
            k[0] === "public" &&
            k[1] === "businesses" &&
            k[3] === "availability"
          );
        },
      });
      toast.success("Booking cancelled");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.completeBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      toast.success("Booking completed!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to complete booking");
    },
  });
}

export function useServiceAvailability(serviceId: number, date: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.services.availability(serviceId, date, endDate),
    queryFn: () => api.getServiceAvailability(serviceId, date, endDate),
    enabled: !!serviceId && !!date,
  });
}

/** Public: next 5-7 days availability from the backend (first service; booked slots excluded). */
export function useBusinessAvailability(slug: string, startDate: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.businessAvailability(slug, startDate, endDate),
    queryFn: () => api.getPublicBusinessAvailability(slug, startDate, endDate),
    enabled: !!slug && !!startDate,
    staleTime: 60 * 1000, // 1 min so cards don’t refetch too often
  });
}

/** Public: availability slots for a service (customer booking flow; no auth). */
export function usePublicServiceAvailability(
  serviceId: number,
  date: string,
  endDate?: string
) {
  return useQuery({
    queryKey: queryKeys.publicServiceAvailability(serviceId, date, endDate),
    queryFn: () => api.getPublicServiceAvailability(serviceId, date, endDate),
    enabled: !!serviceId && !!date,
  });
}
