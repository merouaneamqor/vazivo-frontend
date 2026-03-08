/**
 * Business Feature — API Client
 * @module src/features/business/api
 */

import type { Business, BusinessFormValues } from "../types";

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

export const businessApi = {
  /** Get business by slug (public). */
  getBySlug: (slug: string) =>
    apiFetch<{ business: Business }>(`/api/v1/businesses/${slug}`),

  /** List provider's own businesses. */
  listMine: () =>
    apiFetch<{ businesses: Business[] }>("/api/v1/provider/businesses"),

  /** Create a new business. */
  create: (values: BusinessFormValues) =>
    apiFetch<{ business: Business }>("/api/v1/businesses", {
      method: "POST",
      body: JSON.stringify(values),
    }),

  /** Update an existing business. */
  update: (id: number, values: Partial<BusinessFormValues>) =>
    apiFetch<{ business: Business }>(`/api/v1/businesses/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    }),

  /** Delete a business. */
  delete: (id: number) =>
    apiFetch<void>(`/api/v1/businesses/${id}`, { method: "DELETE" }),
};
