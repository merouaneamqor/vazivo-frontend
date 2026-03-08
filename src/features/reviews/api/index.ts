/**
 * Reviews Feature — API Client
 * @module src/features/reviews/api
 */

import type { Review, ReviewBreakdownData, CreateReviewPayload } from "../types";

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

export const reviewsApi = {
  /** List reviews for a business. */
  listForBusiness: (businessId: number, page = 1) =>
    apiFetch<{ reviews: Review[]; breakdown: ReviewBreakdownData; total: number }>(
      `/api/v1/businesses/${businessId}/reviews?page=${page}`
    ),

  /** Get a single review. */
  get: (id: number) =>
    apiFetch<{ review: Review }>(`/api/v1/reviews/${id}`),

  /** Submit a new review. */
  create: (payload: CreateReviewPayload) =>
    apiFetch<{ review: Review }>("/api/v1/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Provider: reply to a review. */
  reply: (id: number, reply: string) =>
    apiFetch<{ review: Review }>(`/api/v1/reviews/${id}/reply`, {
      method: "PUT",
      body: JSON.stringify({ reply }),
    }),
};
