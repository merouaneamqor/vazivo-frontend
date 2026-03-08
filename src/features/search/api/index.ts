/**
 * Search Feature — API Client
 * @module src/features/search/api
 */

import type { SearchFiltersState, SearchResult, SearchMeta } from "../types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const searchApi = {
  /** Full-text search across businesses/services. */
  search: (filters: Partial<SearchFiltersState>) => {
    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)])
    );
    return apiFetch<{ results: SearchResult[]; meta: SearchMeta }>(
      `/api/v1/search?${params}`
    );
  },

  /** Autocomplete suggestions for the search bar. */
  suggest: (query: string) =>
    apiFetch<{ suggestions: string[] }>(`/api/v1/search/suggest?q=${encodeURIComponent(query)}`),

  /** Metadata (cities, categories) for filter dropdowns. */
  metadata: () =>
    apiFetch<{ cities: string[]; categories: string[] }>("/api/v1/search/metadata"),
};
