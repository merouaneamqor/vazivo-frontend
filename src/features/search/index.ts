/**
 * Search Feature — Public API
 * @module src/features/search
 */

export type { SearchFiltersState, SearchResult, SearchMeta } from "./types";
export { smartFiltersFlag, mapViewFlag } from "./flags";
export { searchApi } from "./api";

// Components
export { default as SearchBar } from "@/components/HeroSearchBar";
export { default as SearchFilters } from "@/components/SearchFilters";
export { SmartFilters } from "@/components/SmartFilters";
export { default as SearchMapView } from "@/components/SearchMapView";
export { ResultsGrid } from "@/components/search/ResultsGrid";
export { FiltersToolbar } from "@/components/search/FiltersToolbar";
export { FiltersDrawerMobile } from "@/components/search/FiltersDrawerMobile";

// Hooks
export { useSearchFilters } from "@/hooks/useSearchMetadata";
