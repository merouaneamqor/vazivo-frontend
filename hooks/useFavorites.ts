"use client";

import { useState, useEffect, useCallback } from "react";
import type { Business } from "@/types";

/** Normalize API city/category (string or object with name) to string. Local to avoid Turbopack mis-resolving utils in client bundle. */
function toDisplayString(value: unknown): string {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "name" in value && typeof (value as { name: unknown }).name === "string")
    return (value as { name: string }).name;
  return "";
}

const FAVORITES_KEY = "ollazen_favorites";
const LEGACY_KEYS = ["favorites", "booking_favorites", "saved_places", "glow_favorites", "ollazen_favorites"];

interface FavoriteItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  city: string;
  image_url?: string;
  average_rating: number;
  total_reviews: number;
  addedAt: string;
}

function parseStoredFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];

  for (const key of LEGACY_KEYS) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) continue;

      const parsed = JSON.parse(stored) as unknown;
      let raw: unknown[] = [];

      if (Array.isArray(parsed)) {
        raw = parsed;
      } else if (parsed && typeof parsed === "object" && "bookings" in parsed) {
        raw = Array.isArray((parsed as { bookings: unknown[] }).bookings)
          ? (parsed as { bookings: unknown[] }).bookings
          : [];
      } else if (parsed && typeof parsed === "object" && ("favorites" in parsed || "items" in parsed)) {
        const arr = (parsed as { favorites?: unknown[]; items?: unknown[] }).favorites
          ?? (parsed as { favorites?: unknown[]; items?: unknown[] }).items;
        raw = Array.isArray(arr) ? arr : [];
      }

      const items: FavoriteItem[] = raw
        .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
        .map((item) => ({
          id: Number(item.id),
          slug: String(item.slug ?? ""),
          name: String(item.name ?? ""),
          category: String(item.category ?? ""),
          city: String(item.city ?? ""),
          image_url: item.image_url != null ? String(item.image_url) : undefined,
          average_rating: Number(item.average_rating) || 0,
          total_reviews: Number(item.total_reviews) || 0,
          addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
        }))
        .filter((item) => item.id > 0 && item.slug && item.name);

      if (items.length > 0) {
        if (key !== FAVORITES_KEY) {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
          try {
            localStorage.removeItem(key);
          } catch {
            // ignore
          }
        }
        return items;
      }
    } catch {
      continue;
    }
  }

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as unknown;
      const raw = Array.isArray(parsed) ? parsed : [];
      const items: FavoriteItem[] = raw
        .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
        .map((item) => ({
          id: Number(item.id),
          slug: String(item.slug ?? ""),
          name: String(item.name ?? ""),
          category: String(item.category ?? ""),
          city: String(item.city ?? ""),
          image_url: item.image_url != null ? String(item.image_url) : undefined,
          average_rating: Number(item.average_rating) || 0,
          total_reviews: Number(item.total_reviews) || 0,
          addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
        }))
        .filter((item) => item.id > 0 && item.slug && item.name);
      return items;
    }
  } catch (error) {
    console.error("Failed to load favorites:", error);
  }
  return [];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    setFavorites(parseStoredFavorites());
  }, []);

  // Load favorites from localStorage on mount and when window regains focus
  useEffect(() => {
    if (typeof window === "undefined") return;

    loadFromStorage();
    setIsLoaded(true);

    const onFocus = () => {
      loadFromStorage();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadFromStorage]);

  // Save favorites to localStorage
  const saveFavorites = useCallback((items: FavoriteItem[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    }
  }, []);

  // Check if a business is favorited
  const isFavorite = useCallback(
    (businessId: number) => {
      return favorites.some((f) => f.id === businessId);
    },
    [favorites]
  );

  // Add a business to favorites
  const addFavorite = useCallback(
    (business: Business) => {
      if (isFavorite(business.id)) return;

      const newFavorite: FavoriteItem = {
        id: business.id,
        slug: business.slug,
        name: business.name,
        category: toDisplayString(business.category),
        city: toDisplayString(business.city),
        image_url: business.logo_url || business.image_urls?.[0],
        average_rating: business.average_rating,
        total_reviews: business.total_reviews,
        addedAt: new Date().toISOString(),
      };

      const updated = [newFavorite, ...favorites];
      setFavorites(updated);
      saveFavorites(updated);
    },
    [favorites, isFavorite, saveFavorites]
  );

  // Remove a business from favorites
  const removeFavorite = useCallback(
    (businessId: number) => {
      const updated = favorites.filter((f) => f.id !== businessId);
      setFavorites(updated);
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (business: Business) => {
      if (isFavorite(business.id)) {
        removeFavorite(business.id);
        return false;
      } else {
        addFavorite(business);
        return true;
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    isLoaded,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
