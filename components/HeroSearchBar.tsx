"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchFilters } from "@/hooks/useSearchMetadata";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function toDisplayStr(v: unknown): string {
  if (typeof v === "string" && v) return v;
  if (v && typeof v === "object" && "name" in v && typeof (v as { name: unknown }).name === "string")
    return (v as { name: string }).name;
  return "";
}
function slug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "all";
}
function searchPath(city?: string | null, category?: string | null): string {
  const c = category && typeof category === "string" ? category : null;
  const t = city && typeof city === "string" ? city : null;
  if (c) return t ? `/${slug(c)}/${slug(t)}` : `/search/all/${slug(c)}`;
  return t ? `/search/${slug(t)}` : "/search";
}
function businessPath(b: { city?: unknown; category?: unknown; slug: string }): string {
  const cs = toDisplayStr(b.city) ? slug(toDisplayStr(b.city)) : "all";
  const cat = toDisplayStr(b.category) ? slug(toDisplayStr(b.category)) : "all";
  const sl = typeof b.slug === "string" && b.slug ? b.slug : "all";
  return `/${cs}/${cat}/${sl}`;
}

interface HeroSearchBarProps {
  variant?: "hero" | "compact" | "expanded" | "searchPage";
  className?: string;
  onSearch?: (params: { city: string; category: string }) => void;
  /** Initial values (e.g. from URL) so the bar reflects current search */
  initialCity?: string;
  initialCategory?: string;
}

export default function HeroSearchBar({
  variant = "hero",
  className,
  onSearch,
  initialCity = "",
  initialCategory = "",
}: HeroSearchBarProps) {
  const router = useRouter();
  const t = useTranslations("home");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [cityHighlightIndex, setCityHighlightIndex] = useState(-1);
  const [categoryHighlightIndex, setCategoryHighlightIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync internal state when initial values change (e.g. URL updated)
  useEffect(() => {
    setCity(initialCity);
    setCategory(initialCategory);
  }, [initialCity, initialCategory]);

  // Autocomplete data from search_metadata API
  const { data: filtersData, isLoading } = useSearchFilters();
  const cities = filtersData?.cities || [];
  const categories = filtersData?.categories || [];

  // Search businesses by name for autocomplete
  const { data: businessesData } = useQuery({
    queryKey: ["businesses", "autocomplete", query],
    queryFn: () => api.getBusinesses({ q: query, per_page: 5 }),
    enabled: query.trim().length >= 2,
  });
  const businesses = businessesData?.businesses || [];

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes((city || query).trim().toLowerCase())
  );
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes((category || query).trim().toLowerCase())
  );

  // When empty (just focused): show default values from metadata. When typing: show filtered, capped.
  const cityLimit = city.trim() === "" ? 25 : 10;
  const categoryLimit = category.trim() === "" ? 25 : 10;
  const cityOptions = filteredCities.slice(0, cityLimit);
  const categoryOptions = filteredCategories.slice(0, categoryLimit);

  // Reset highlight when options change
  useEffect(() => {
    setCategoryHighlightIndex(showCategorySuggestions ? 0 : -1);
  }, [category, showCategorySuggestions, categoryOptions.length]);
  useEffect(() => {
    setCityHighlightIndex(showCitySuggestions ? 0 : -1);
  }, [city, showCitySuggestions, cityOptions.length]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ city, category });
      return;
    }
    // Doctolib-style: when both city and category, go to /category/city
    if (city && category) {
      router.push(searchPath(city, category));
    } else {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (city) params.set("city", city);
      if (category) params.set("category", category);
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.trim().length >= 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (!showCategorySuggestions || categoryOptions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCategoryHighlightIndex((i) => (i < categoryOptions.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCategoryHighlightIndex((i) => (i > 0 ? i - 1 : categoryOptions.length - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = categoryOptions[categoryHighlightIndex];
      if (item) {
        setCategory(item.name);
        setShowCategorySuggestions(false);
      } else {
        handleSearch();
      }
      return;
    }
    if (e.key === "Escape") {
      setShowCategorySuggestions(false);
      setCategoryHighlightIndex(-1);
      return;
    }
    handleKeyDown(e);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (!showCitySuggestions || cityOptions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCityHighlightIndex((i) => (i < cityOptions.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCityHighlightIndex((i) => (i > 0 ? i - 1 : cityOptions.length - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = cityOptions[cityHighlightIndex];
      if (item) {
        setCity(item.name);
        setShowCitySuggestions(false);
      } else {
        handleSearch();
      }
      return;
    }
    if (e.key === "Escape") {
      setShowCitySuggestions(false);
      setCityHighlightIndex(-1);
      return;
    }
    handleKeyDown(e);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (queryInputRef.current && !queryInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
      if (categoryInputRef.current && !categoryInputRef.current.contains(e.target as Node)) {
        setShowCategorySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-2 p-2 bg-white rounded-full shadow-soft border border-neutral-100",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 px-3">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full bg-transparent text-sm outline-none placeholder-neutral-400"
            onKeyDown={handleKeyDown}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={handleSearch} className="rounded-full px-4">
          Search
        </Button>
      </motion.div>
    );
  }

  // Search page: compact bar; city + category from search_metadata API (useSearchFilters)
  if (variant === "searchPage") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-col gap-0 sm:flex-row sm:items-center w-full bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-neutral-200">
          <div className="relative flex-1 min-w-0" ref={categoryInputRef}>
            <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 h-full sm:border-r border-neutral-200">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 flex-shrink-0" aria-hidden />
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setShowCategorySuggestions(true);
                }}
                onFocus={() => setShowCategorySuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={t("serviceCategory")}
                autoComplete="off"
                className="w-full bg-transparent text-neutral-900 placeholder-neutral-400 outline-none text-sm sm:text-base min-w-0"
                aria-label="Search by service"
              />
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-lg sm:rounded-xl flex-shrink-0 transition-colors touch-manipulation"
                  aria-label="Clear service"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showCategorySuggestions && categoryOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
                >
                  {categoryOptions.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        setCategory(c.name);
                        setShowCategorySuggestions(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-3 sm:py-2 transition-colors text-left hover:bg-neutral-50 active:bg-neutral-100 touch-manipulation"
                    >
                      <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate text-[15px] sm:text-sm">{c.name}</p>
                        <p className="text-xs text-neutral-500">
                          {c.business_count} {t("businesses")}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative flex-1 min-w-0 sm:min-w-[120px]" ref={cityInputRef}>
            <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 h-full sm:border-r border-neutral-200">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 flex-shrink-0" aria-hidden />
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={t("cityCity")}
                autoComplete="off"
                className="w-full bg-transparent text-neutral-900 placeholder-neutral-400 outline-none text-sm sm:text-base min-w-0"
                aria-label="Search by location"
              />
              {city && (
                <button
                  type="button"
                  onClick={() => setCity("")}
                  className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-lg sm:rounded-xl flex-shrink-0 transition-colors touch-manipulation"
                  aria-label="Clear location"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showCitySuggestions && cityOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-soft-lg border border-neutral-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
                >
                  {cityOptions.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        setCity(c.name);
                        setShowCitySuggestions(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-3 sm:py-2 transition-colors text-left hover:bg-neutral-50 active:bg-neutral-100 touch-manipulation"
                    >
                      <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate text-[15px] sm:text-sm">{c.name}</p>
                        <p className="text-xs text-neutral-500">{c.business_count} {t("businesses")}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-shrink-0 p-2 sm:p-3 sm:pl-1.5">
            <Button
              type="button"
              onClick={handleSearch}
              size="sm"
              className="w-full sm:w-auto h-11 sm:h-10 px-5 sm:px-6 font-semibold touch-manipulation"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" aria-hidden />
              <span className="text-sm sm:text-base">{t("searchButton")}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-stretch min-w-0">
          {/* General Search Input (Salon name, etc.) */}
          <div className="relative flex-[2] min-w-0" ref={queryInputRef}>
            <div className="flex items-center gap-3 px-4 py-4 sm:py-3.5 h-full sm:border-r border-neutral-200">
              <Search className="h-5 w-5 text-primary-500 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-neutral-500 mb-1 text-left">
                  {t("searchLabel")}
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("searchPlaceholder")}
                  autoComplete="off"
                  className="w-full bg-transparent text-neutral-900 placeholder-neutral-400 outline-none text-base min-w-0"
                  aria-label="Search"
                />
              </div>
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-xl flex-shrink-0 transition-colors touch-manipulation"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {showSuggestions && (businesses.length > 0 || filteredCategories.length > 0 || filteredCities.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-neutral-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                >
                  {/* Businesses section */}
                  {businesses.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-500 uppercase">{t("salons")}</p>
                      </div>
                      {businesses.map((business) => (
                        <button
                          key={business.id}
                          type="button"
                          onClick={() => {
                            router.push(businessPath(business));
                            setShowSuggestions(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-100 last:border-b-0"
                        >
                          <Sparkles className="h-4 w-4 text-primary-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-neutral-900 truncate">{business.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{toDisplayStr(business.city)} • {toDisplayStr(business.category)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Categories section */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-500 uppercase">{t("categories")}</p>
                      </div>
                      {filteredCategories.slice(0, 3).map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => {
                            setQuery(c.name);
                            setCategory(c.name);
                            setShowSuggestions(false);
                            setTimeout(handleSearch, 100);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-100 last:border-b-0"
                        >
                          <Sparkles className="h-4 w-4 text-accent-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate">{c.name}</p>
                            <p className="text-xs text-neutral-500">{c.business_count} {t("establishments")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cities section */}
                  {filteredCities.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-500 uppercase">{t("cities")}</p>
                      </div>
                      {filteredCities.slice(0, 3).map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => {
                            setCity(c.name); setShowSuggestions(false);
                            setTimeout(handleSearch, 100);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                        >
                          <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate">{c.name}</p>
                            <p className="text-xs text-neutral-500">{c.business_count} {t("establishments")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* City Input */}
          <div className="relative flex-1 min-w-0 sm:min-w-[140px]" ref={cityInputRef}>
            <div className="flex items-center gap-3 px-4 py-4 sm:py-3.5 h-full sm:border-r border-neutral-200">
              <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-neutral-500 mb-1 text-left">
                  {t("cityCity")}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onKeyDown={handleCityKeyDown}
                  placeholder={t("cityCity")}
                  autoComplete="off"
                  className="w-full bg-transparent text-neutral-900 placeholder-neutral-400 outline-none text-base min-w-0"
                  aria-label="Search by location"
                />
              </div>
              {city && (
                <button
                  type="button"
                  onClick={() => setCity("")}
                  className="p-2 hover:bg-neutral-100 rounded-xl flex-shrink-0 transition-colors touch-manipulation"
                  aria-label="Clear location"
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showCitySuggestions && cityOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-neutral-100 overflow-hidden z-50"
                >
                  {cityOptions.map((c, idx) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        setCity(c.name);
                        setShowCitySuggestions(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 hover:bg-neutral-50 transition-colors text-left",
                        idx === cityHighlightIndex && "bg-neutral-50"
                      )}
                    >
                      <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{c.name}</p>
                        <p className="text-xs text-neutral-500">{c.business_count} {t("establishments")}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Input */}
          <div className="relative flex-1 min-w-0 sm:min-w-[140px]" ref={categoryInputRef}>
            <div className="flex items-center gap-3 px-4 py-4 sm:py-3.5 h-full sm:border-r border-neutral-200">
              <Sparkles className="h-5 w-5 text-accent-500 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-neutral-500 mb-1 text-left">
                  {t("serviceCategory")}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setShowCategorySuggestions(true);
                  }}
                  onFocus={() => setShowCategorySuggestions(true)}
                  onKeyDown={handleCategoryKeyDown}
                  placeholder={t("serviceCategory")}
                  autoComplete="off"
                  className="w-full bg-transparent text-neutral-900 placeholder-neutral-400 outline-none text-base min-w-0"
                  aria-label="Search by service"
                />
              </div>
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className="p-2 hover:bg-neutral-100 rounded-xl flex-shrink-0 transition-colors touch-manipulation"
                  aria-label="Clear service"
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showCategorySuggestions && categoryOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-soft-lg border border-neutral-100 overflow-hidden z-50"
                >
                  {categoryOptions.map((c, idx) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        setCategory(c.name);
                        setShowCategorySuggestions(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 hover:bg-neutral-50 transition-colors text-left",
                        idx === categoryHighlightIndex && "bg-neutral-50"
                      )}
                    >
                      <Sparkles className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{c.name}</p>
                        <p className="text-xs text-neutral-500">
                          {c.business_count} {t("establishments")}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <div className="flex sm:flex-shrink-0 p-3 sm:p-3 sm:pl-2">
            <Button
              type="button"
              onClick={handleSearch}
              size="lg"
              className="w-full sm:w-auto min-h-[56px] sm:min-h-[52px] px-8 font-semibold touch-manipulation"
            >
              <Search className="h-5 w-5 sm:mr-2" aria-hidden />
              <span>{t("searchButton")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick suggestions: use translated categories from API */}
      {isMounted && categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-3 sm:mt-4 px-1">
          <span className="text-xs sm:text-sm text-neutral-500 w-full sm:w-auto text-center sm:text-left">
            {t("popular")}:
          </span>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                setCategory(cat.name);
                setTimeout(handleSearch, 100);
              }}
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline underline-offset-2 touch-manipulation"
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
