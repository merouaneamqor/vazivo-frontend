"use client";

import { useState, useEffect, useRef } from "react";
import { debounce } from "@/lib/utils";
import {
  searchCities,
  searchNeighborhoods,
  type NominatimPlace,
  getCityDisplayName,
  getNeighborhoodDisplayName,
} from "@/lib/nominatim";

/** Debounced city search (1s) for Nominatim rate limit */
export function useNominatimCitySearch(
  query: string,
  enabled: boolean,
  countryCode?: string
) {
  const [results, setResults] = useState<NominatimPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedRef = useRef<((q: string, code?: string) => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return;
    }
    if (!query || query.trim().length < 3) {
      setResults([]);
      return;
    }

    if (!debouncedRef.current) {
      debouncedRef.current = debounce(async (q: string, code?: string) => {
        setLoading(true);
        try {
          const data = await searchCities(q, 10, code);
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 1000);
    }

    debouncedRef.current(query, countryCode);
  }, [query, enabled, countryCode]);

  return { results, loading, getCityDisplayName };
}

/** Debounced neighborhood search (1s) for Nominatim rate limit */
export function useNominatimNeighborhoodSearch(
  query: string,
  city: string,
  enabled: boolean
) {
  const [results, setResults] = useState<NominatimPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedRef = useRef<((q: string, c: string) => void) | null>(null);

  useEffect(() => {
    if (!enabled || !city?.trim()) {
      setResults([]);
      return;
    }
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (!debouncedRef.current) {
      debouncedRef.current = debounce(async (q: string, c: string) => {
        setLoading(true);
        try {
          const data = await searchNeighborhoods(q, c, 10);
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 1000);
    }

    debouncedRef.current(query, city);
  }, [query, city, enabled]);

  return { results, loading, getNeighborhoodDisplayName };
}
