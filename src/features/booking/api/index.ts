/**
 * Booking Feature — API Client
 *
 * Typed fetch wrappers for all booking-related endpoints.
 * Delegates to the shared lib/api.ts base client for auth headers
 * and error handling.
 *
 * @module src/features/booking/api
 */

import type { Booking, CreateBookingPayload, BookingSlot } from "../types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

/* ── Bookings ────────────────────────────────────────────────────────────── */

export const bookingApi = {
  /** List bookings for the authenticated customer. */
  list: (params?: { status?: string; page?: number }) =>
    apiFetch<{ bookings: Booking[]; total: number }>(
      `/api/v1/bookings?${new URLSearchParams(params as Record<string, string>)}`
    ),

  /** Fetch a single booking by ID. */
  get: (id: number) =>
    apiFetch<{ booking: Booking }>(`/api/v1/bookings/${id}`),

  /** Create a new booking. */
  create: (payload: CreateBookingPayload) =>
    apiFetch<{ booking: Booking }>("/api/v1/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Cancel a booking. */
  cancel: (id: number, reason?: string) =>
    apiFetch<{ booking: Booking }>(`/api/v1/bookings/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  /** Fetch available slots for a service on a given date. */
  slots: (serviceId: number, date: string) =>
    apiFetch<{ slots: BookingSlot[] }>(
      `/api/v1/services/${serviceId}/slots?date=${date}`
    ),
};
