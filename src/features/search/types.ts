/**
 * Search Feature — Type Definitions
 * @module src/features/search/types
 */

export interface SearchFiltersState {
  query: string;
  city: string;
  category: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availableToday?: boolean;
  sortBy: "relevance" | "rating" | "price_asc" | "price_desc" | "distance";
  page: number;
}

export interface SearchResult {
  id: number;
  slug: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  coverImageUrl?: string;
  lat?: number;
  lng?: number;
  distance?: number;         // km from search center
  availableToday: boolean;
}

export interface SearchMeta {
  total: number;
  page: number;
  perPage: number;
  cities: string[];
  categories: string[];
}
