import { useQuery } from "@tanstack/react-query";
import type { ProviderSearchResults } from "@/types/provider-search";
import { api } from "@/lib/api";

export async function searchProvider(query: string): Promise<ProviderSearchResults> {
  return api.getProviderSearch(query);
}

export function useProviderSearch(query: string, enabled: boolean = true) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["provider-search", trimmed],
    queryFn: () => searchProvider(trimmed),
    enabled: enabled,
    staleTime: 30_000,
  });
}
