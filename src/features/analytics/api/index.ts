/**
 * Analytics Feature — API Client
 * @module src/features/analytics/api
 */

import type { AnalyticsDashboard } from "../types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const analyticsApi = {
  /** Admin overview dashboard data. */
  adminDashboard: (period: "7d" | "30d" | "90d" = "30d") =>
    apiFetch<AnalyticsDashboard>(`/api/v1/admin/analytics?period=${period}`),

  /** Provider-specific statistics. */
  providerStats: (businessId: number, period: "7d" | "30d" | "90d" = "30d") =>
    apiFetch<AnalyticsDashboard>(
      `/api/v1/provider/businesses/${businessId}/statistics?period=${period}`
    ),
};
