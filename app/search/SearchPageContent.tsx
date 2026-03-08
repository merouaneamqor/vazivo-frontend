"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Map,
  List,
  ChevronDown,
  Scissors,
  Sparkles,
  Heart,
  Dumbbell,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import api from "@/lib/api";
import HeroSearchBar from "@/components/HeroSearchBar";
import SearchFilters, {
  ActiveFilters,
  getDefaultFilters,
  type SearchFiltersState,
} from "@/components/SearchFilters";
import ProviderCard, {
  ProviderCardSkeleton,
} from "@/components/search/ProviderCard";
import { RestaurantCard } from "@/components/vazivo";

const SearchMapView = dynamic(() => import("@/components/SearchMapView"), {
  ssr: false,
});
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/Pagination";
import { getPaginationSeries } from "@/lib/paginationSeries";
import { cn, cityNameToSlug } from "@/lib/utils";
import { unslugify } from "@/lib/seo-meta";
import { getCityCenter } from "@/lib/city-coordinates";
import { useSearchFilters, type City } from "@/hooks/useSearchMetadata";
import type { Business } from "@/types";

/* ──────────────────────── quick chips ──────────────────────── */

const quickChips: never[] = [];

/* ──────────────────────── sort options ──────────────────────── */

const sortOptions = [
  { value: "relevance", label: "Recommended" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_low", label: "Cheapest" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "newest", label: "New Providers" },
];

/* ──────────────────────── main component ──────────────────────── */

export default function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  // /search/[city]/[category] uses params.city, params.category; /[segment1]/[segment2] (Doctolib) uses segment1=category, segment2=city
  const pathCitySlug = (params?.city ?? params?.segment2) as string | undefined;
  const pathCategorySlug = (params?.category ?? params?.segment1) as string | undefined;
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [hoveredBusinessId, setHoveredBusinessId] = useState<number | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapBoundsDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const mapInitializedRef = useRef(false);
  const resultsScrollRef = useRef<HTMLDivElement>(null);

  const { data: filtersData } = useSearchFilters();
  const defaultMaxPrice = filtersData?.price_range?.max || 500;

  const isUpdatingUrl = useRef(false);
  const currentUrlParams = useRef(searchParams.toString());

  const [filters, setFilters] = useState<SearchFiltersState>(() => ({
    category: searchParams.get("category") || searchParams.get("keyword") || searchParams.get("cuisine") || "",
    city: searchParams.get("city") || searchParams.get("location") || "",
    minRating: Number(searchParams.get("min_rating")) || 0,
    priceRange: [
      Number(searchParams.get("min_price")) || 0,
      Number(searchParams.get("max_price")) || defaultMaxPrice,
    ],
    availableToday: searchParams.get("available_today") === "true",
    sortBy: searchParams.get("sort") || "relevance",
  }));

  // ─── Redirect old /search/city/category to Doctolib-style /category/city ───
  useEffect(() => {
    if (pathname.startsWith("/search/")) {
      const afterSearch = pathname.replace(/^\/search\/?/, "");
      const parts = afterSearch.split("/").filter(Boolean);
      if (parts.length === 2 && parts[0] !== "all") {
        const [cityPart, categoryPart] = parts;
        const query = typeof window !== "undefined" ? window.location.search : "";
        router.replace(`/${categoryPart}/${cityPart}${query}`);
        return;
      }
    }
  }, [pathname, router]);

  // ─── Resolve slugs from URL path ───
  useEffect(() => {
    if (!filtersData) return;
    if (pathCitySlug && pathCitySlug !== "all") {
      const city = filtersData.cities.find(
        (c) => c.slug === pathCitySlug || c.slug.toLowerCase() === pathCitySlug.toLowerCase()
      );
      if (city) {
        setFilters((prev) => (prev.city === city.name ? prev : { ...prev, city: city.name }));
      } else {
        // City not in metadata (e.g. new city); use slug as display name so /search/casablanca still works
        setFilters((prev) => (prev.city === unslugify(pathCitySlug) ? prev : { ...prev, city: unslugify(pathCitySlug) }));
      }
    } else if (pathCitySlug === "all") {
      setFilters((prev) => (prev.city ? { ...prev, city: "" } : prev));
    }
    if (pathCategorySlug) {
      const category = filtersData.categories.find(
        (c) => c.slug === pathCategorySlug || c.slug.toLowerCase() === pathCategorySlug.toLowerCase()
      );
      if (category) {
        setFilters((prev) =>
          prev.category === category.slug ? prev : { ...prev, category: category.slug }
        );
      } else {
        // Category not in metadata; keep slug so search still runs
        setFilters((prev) =>
          prev.category === pathCategorySlug ? prev : { ...prev, category: pathCategorySlug }
        );
      }
    }
  }, [pathCitySlug, pathCategorySlug, filtersData, router]);

  // ─── Validate filters ───
  useEffect(() => {
    if (!filtersData) return;
    const validCategorySlugs = filtersData.categories.map((c) => c.slug);
    const validCities = filtersData.cities.map((c) => c.name);
    if (filters.category && !validCategorySlugs.includes(filters.category))
      setFilters((prev) => ({ ...prev, category: "" }));
    if (
      filters.city &&
      !pathCitySlug &&
      !validCities.some((c) => c.toLowerCase() === filters.city.toLowerCase())
    )
      setFilters((prev) => ({ ...prev, city: "" }));
  }, [filtersData, filters.category, filters.city, pathCitySlug]);

  // ─── Update price range default ───
  useEffect(() => {
    if (filtersData?.price_range && !searchParams.get("max_price")) {
      setFilters((prev) => {
        const currentMax = prev.priceRange[1];
        if (currentMax === 500 || currentMax === filtersData.price_range.max) {
          return { ...prev, priceRange: [prev.priceRange[0], filtersData.price_range.max] };
        }
        return prev;
      });
    }
  }, [filtersData]);

  // ─── Sync URL ───
  useEffect(() => {
    const search = searchParams.toString();
    currentUrlParams.current = search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const pageFromUrl = Math.max(1, Number(searchParams.get("page")) || 1);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  useEffect(() => {
    setCurrentPage(Math.max(1, Number(searchParams.get("page")) || 1));
  }, [searchParams]);

  // ─── Update URL from filters ───
  useEffect(() => {
    if (isUpdatingUrl.current) return;
    const q = new URLSearchParams();
    if (filters.minRating > 0) q.set("min_rating", String(filters.minRating));
    if (filters.priceRange[0] > 0) q.set("min_price", String(filters.priceRange[0]));
    if (filters.priceRange[1] < defaultMaxPrice) q.set("max_price", String(filters.priceRange[1]));
    if (filters.availableToday) q.set("available_today", "true");
    if (filters.sortBy !== "relevance") q.set("sort", filters.sortBy);
    if (currentPage > 1) q.set("page", String(currentPage));

    const resolvedCitySlug =
      filters.city && filtersData
        ? filtersData.cities.find((c) => c.name.toLowerCase() === filters.city.toLowerCase())
          ?.slug ?? cityNameToSlug(filters.city)
        : null;
    // Category is stored as slug
    const resolvedCategorySlug = filters.category || null;

    const citySlug =
      pathCitySlug && (!filters.city || resolvedCitySlug === pathCitySlug)
        ? pathCitySlug
        : resolvedCitySlug;
    const categorySlug =
      pathCategorySlug && (!filters.category || resolvedCategorySlug === pathCategorySlug)
        ? pathCategorySlug
        : resolvedCategorySlug;

    if (!citySlug && filters.city) q.set("city", filters.city);
    if (!categorySlug && filters.category) q.set("category", filters.category);

    const queryString = q.toString();
    let newUrl: string;
    if (categorySlug && citySlug)
      newUrl = `/${categorySlug}/${citySlug}${queryString ? `?${queryString}` : ""}`;
    else if (categorySlug && !citySlug)
      newUrl = `/search/all/${categorySlug}${queryString ? `?${queryString}` : ""}`;
    else if (citySlug) newUrl = `/search/${citySlug}${queryString ? `?${queryString}` : ""}`;
    else newUrl = queryString ? `/search?${queryString}` : "/search";

    if (newUrl !== currentUrlParams.current) {
      isUpdatingUrl.current = true;
      router.replace(newUrl, { scroll: false });
      currentUrlParams.current = newUrl;
      requestAnimationFrame(() => {
        isUpdatingUrl.current = false;
      });
    }
  }, [filters, currentPage, router, defaultMaxPrice, filtersData, pathCitySlug, pathCategorySlug]);

  // ─── Map handlers ───
  const handleMapBoundsChange = useCallback(
    (center: { lat: number; lng: number }, radius: number) => {
      if (!mapInitializedRef.current) {
        mapInitializedRef.current = true;
        return;
      }
      if (mapBoundsDebounceRef.current) clearTimeout(mapBoundsDebounceRef.current);
      mapBoundsDebounceRef.current = setTimeout(() => {
        setMapLocation({ lat: center.lat, lng: center.lng, radius });
      }, 500);
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (mapBoundsDebounceRef.current) clearTimeout(mapBoundsDebounceRef.current);
    };
  }, []);

  // ─── Query ───
  const queryKey = [
    "businesses",
    "search",
    filters.category,
    filters.city,
    filters.minRating,
    filters.priceRange[0],
    filters.priceRange[1],
    filters.availableToday,
    filters.sortBy,
    currentPage,
    mapLocation?.lat,
    mapLocation?.lng,
    mapLocation?.radius,
  ];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.searchBusinesses({
        category: filters.category || undefined,
        cuisine: filters.category || undefined,
        city: filters.city || undefined,
        min_rating: filters.minRating || undefined,
        min_price: filters.priceRange[0] || undefined,
        max_price: filters.priceRange[1] < defaultMaxPrice ? filters.priceRange[1] : undefined,
        sort_by: filters.sortBy !== "relevance" ? filters.sortBy : undefined,
        page: currentPage,
        per_page: 12,
        ...(mapLocation && {
          lat: mapLocation.lat,
          lng: mapLocation.lng,
          radius: mapLocation.radius,
        }),
      });
      return response;
    },
  });

  const businesses = data?.businesses || [];
  const totalCount = data?.meta?.total_count ?? 0;
  const totalPages = data?.meta?.total_pages ?? 1;
  const hasNextPage = data?.meta && data.meta.current_page < data.meta.total_pages;
  const hasPrevPage = currentPage > 1;

  // Get hovered business object
  const hoveredBusiness = hoveredBusinessId 
    ? businesses.find(b => b.id === hoveredBusinessId) 
    : null;

  // Default map center when user has selected a city (from filter or URL path)
  const cityCenter = useMemo((): [number, number] | null => {
    const cityToResolve = filters.city || (pathCitySlug && pathCitySlug !== "all" ? pathCitySlug : null);
    if (!cityToResolve) return null;
    const fromApi = filtersData?.cities?.find(
      (c: City) =>
        c.name === cityToResolve ||
        c.slug === cityToResolve ||
        c.name.toLowerCase() === cityToResolve.toLowerCase()
    ) as City | undefined;
    if (fromApi?.lat != null && fromApi?.lng != null) {
      return [fromApi.lat, fromApi.lng];
    }
    return getCityCenter(cityToResolve);
  }, [filters.city, pathCitySlug, filtersData?.cities]);

  const resetFilters = () => {
    setFilters(getDefaultFilters(defaultMaxPrice));
    setCurrentPage(1);
  };

  const handleFiltersChange = useCallback((newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const activeFilterCount = [
    filters.category,
    filters.city,
    filters.minRating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < defaultMaxPrice,
    filters.availableToday,
  ].filter(Boolean).length;

  const citySlugForBreadcrumb =
    filters.city && filtersData
      ? filtersData.cities.find((c) => c.name.toLowerCase() === filters.city.toLowerCase())
          ?.slug ?? cityNameToSlug(filters.city)
      : null;
  const categorySlugForBreadcrumb = filters.category || null;
  const categoryDisplayName =
    filters.category && filtersData
      ? filtersData.categories.find((c) => c.slug === filters.category)?.name ?? filters.category
      : "";

  const currentSortLabel =
    sortOptions.find((o) => o.value === filters.sortBy)?.label || "Recommended";

  // Build search URL for a given page (path + query). Used for numbered links and SEO prev/next.
  const buildSearchPageUrl = useCallback(
    (page: number) => {
      const q = new URLSearchParams();
      if (filters.minRating > 0) q.set("min_rating", String(filters.minRating));
      if (filters.priceRange[0] > 0) q.set("min_price", String(filters.priceRange[0]));
      if (filters.priceRange[1] < defaultMaxPrice) q.set("max_price", String(filters.priceRange[1]));
      if (filters.availableToday) q.set("available_today", "true");
      if (filters.sortBy !== "relevance") q.set("sort", filters.sortBy);
      if (page > 1) q.set("page", String(page));

      const resolvedCitySlug =
        filters.city && filtersData
          ? filtersData.cities.find((c) => c.name.toLowerCase() === filters.city.toLowerCase())
              ?.slug ?? cityNameToSlug(filters.city)
          : null;
      const resolvedCategorySlug = filters.category || null;

      const citySlug =
        pathCitySlug && (!filters.city || resolvedCitySlug === pathCitySlug)
          ? pathCitySlug
          : resolvedCitySlug;
      const categorySlug =
        pathCategorySlug && (!filters.category || resolvedCategorySlug === pathCategorySlug)
          ? pathCategorySlug
          : resolvedCategorySlug;

      if (!citySlug && filters.city) q.set("city", filters.city);
      if (!categorySlug && filters.category) q.set("category", filters.category);

      const queryString = q.toString();
      if (categorySlug && citySlug)
        return `/${categorySlug}/${citySlug}${queryString ? `?${queryString}` : ""}`;
      if (categorySlug && !citySlug)
        return `/search/all/${categorySlug}${queryString ? `?${queryString}` : ""}`;
      if (citySlug) return `/search/${citySlug}${queryString ? `?${queryString}` : ""}`;
      return queryString ? `/search?${queryString}` : "/search";
    },
    [
      filters,
      defaultMaxPrice,
      filtersData,
      pathCitySlug,
      pathCategorySlug,
    ]
  );

  const paginationSeries =
    totalPages > 1
      ? getPaginationSeries({ currentPage, totalPages })
      : [];

  // SEO: inject rel prev/next and canonical so crawlers discover paginated pages
  useEffect(() => {
    if (totalPages <= 1) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (!baseUrl) return;
    const prevUrl = currentPage > 1 ? buildSearchPageUrl(currentPage - 1) : null;
    const nextUrl = currentPage < totalPages ? buildSearchPageUrl(currentPage + 1) : null;
    const canonicalUrl = buildSearchPageUrl(currentPage);

    const linkPrev = document.getElementById("link-rel-prev") as HTMLLinkElement | null;
    const linkNext = document.getElementById("link-rel-next") as HTMLLinkElement | null;
    const linkCanonical = document.getElementById("link-rel-canonical-search") as HTMLLinkElement | null;

    if (prevUrl) {
      if (linkPrev) linkPrev.href = `${baseUrl}${prevUrl}`;
      else {
        const el = document.createElement("link");
        el.id = "link-rel-prev";
        el.rel = "prev";
        el.href = `${baseUrl}${prevUrl}`;
        document.head.appendChild(el);
      }
    } else if (linkPrev) linkPrev.remove();

    if (nextUrl) {
      if (linkNext) linkNext.href = `${baseUrl}${nextUrl}`;
      else {
        const el = document.createElement("link");
        el.id = "link-rel-next";
        el.rel = "next";
        el.href = `${baseUrl}${nextUrl}`;
        document.head.appendChild(el);
      }
    } else if (linkNext) linkNext.remove();

    if (linkCanonical) linkCanonical.href = `${baseUrl}${canonicalUrl}`;
    else {
      const el = document.createElement("link");
      el.id = "link-rel-canonical-search";
      el.rel = "canonical";
      el.href = `${baseUrl}${canonicalUrl}`;
      document.head.appendChild(el);
    }

    return () => {
      document.getElementById("link-rel-prev")?.remove();
      document.getElementById("link-rel-next")?.remove();
      document.getElementById("link-rel-canonical-search")?.remove();
    };
  }, [currentPage, totalPages, buildSearchPageUrl]);

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  return (
    <div className="min-h-screen bg-[#FAFAFE]">
      {/* ─── Breadcrumb (Doctolib-style: Home > Category > City) ─── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2">
          <nav aria-label="Breadcrumb" className="text-xs">
            <ol className="flex flex-wrap items-center gap-1.5 text-neutral-400">
              <li>
                <Link href="/" className="hover:text-neutral-700 transition-colors">
                  Accueil
                </Link>
              </li>
              <li aria-hidden className="select-none">/</li>
              <li>
                {categorySlugForBreadcrumb ? (
                  citySlugForBreadcrumb ? (
                    <Link
                      href={`/search/all/${categorySlugForBreadcrumb}`}
                      className="hover:text-neutral-700 transition-colors"
                    >
                      {categoryDisplayName}
                    </Link>
                  ) : (
                    <span className="font-medium text-neutral-700" aria-current="page">
                      {categoryDisplayName}
                    </span>
                  )
                ) : citySlugForBreadcrumb ? (
                  <Link href="/search" className="hover:text-neutral-700 transition-colors">
                    Recherche
                  </Link>
                ) : (
                  <span className="font-medium text-neutral-700" aria-current="page">
                    Recherche
                  </span>
                )}
              </li>
              {filters.city && citySlugForBreadcrumb && (
                <>
                  <li aria-hidden className="select-none">/</li>
                  <li>
                    <span className="font-medium text-neutral-700" aria-current="page">
                      {filters.city}
                    </span>
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </div>

      {/* ─── Search bar (Doctolib-style: sticky, full-width) ─── */}
      <div className="lg:sticky lg:top-16 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <p className="text-xs text-neutral-500 mb-2 hidden sm:block">
            Trouvez et réservez en ligne
          </p>
          <HeroSearchBar
            variant="searchPage"
            className="w-full"
            initialCity={filters.city}
            initialCategory={categoryDisplayName}
            onSearch={({ city, category: categoryFromBar }) => {
              const slug =
                categoryFromBar && filtersData
                  ? filtersData.categories.find(
                      (c) => c.slug === categoryFromBar || c.name === categoryFromBar
                    )?.slug ?? categoryFromBar
                  : categoryFromBar;
              setFilters((prev) => ({ ...prev, city, category: slug || "" }));
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ─── 3-Column Layout ─── */}
      <div className="w-full flex flex-col lg:flex-row min-h-0 lg:h-[calc(100vh-10rem)]">
        {/* ── Left: Filter Sidebar (hideable on desktop) ── */}
        {filtersPanelOpen && (
          <aside className="hidden lg:block w-[280px] flex-shrink-0 border-r border-neutral-100 bg-white px-5 py-4">
            <SearchFilters
              filters={filters}
              onChange={handleFiltersChange}
              onReset={resetFilters}
              maxPrice={defaultMaxPrice}
              onCollapseSidebar={() => setFiltersPanelOpen(false)}
            />
          </aside>
        )}

        {/* ── Center: Results ── */}
        <main className="flex-1 min-w-0 flex flex-col lg:overflow-hidden">
          {/* Results header (sticky within scroll) */}
          <div className="flex-shrink-0 bg-white border-b border-neutral-100 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: show-filters button (desktop when sidebar hidden) + count + mobile filter */}
              <div className="flex items-center gap-3">
                {/* Desktop: show filters when sidebar is collapsed */}
                {!filtersPanelOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltersPanelOpen(true)}
                    className="hidden lg:inline-flex gap-1.5 rounded-lg border-neutral-200"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                )}
                {/* Mobile filters trigger */}
                <div className="lg:hidden">
                  <SearchFilters
                    filters={filters}
                    onChange={handleFiltersChange}
                    onReset={resetFilters}
                    maxPrice={defaultMaxPrice}
                    mobileOpen={mobileFiltersOpen}
                    onMobileOpenChange={setMobileFiltersOpen}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {isLoading
                      ? "Searching…"
                      : `${totalCount.toLocaleString()} result${totalCount !== 1 ? "s" : ""}`}
                  </p>
                  <p className="text-xs text-neutral-500 truncate max-w-xs">
                    {categoryDisplayName || filters.city
                      ? `${categoryDisplayName || "All"}${filters.city ? ` in ${filters.city}` : ""}`
                      : "All providers"}
                  </p>
                </div>
              </div>

              {/* Right: sort + view toggle */}
              <div className="flex items-center gap-2">
                {/* Sorting dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:border-primary-300 transition-colors bg-white"
                  >
                    {currentSortLabel}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-neutral-400 transition-transform",
                        sortOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setSortOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl border border-neutral-100 shadow-soft-lg z-40 py-1"
                        >
                          {sortOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                handleFiltersChange({ ...filters, sortBy: opt.value });
                                setSortOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm transition-colors",
                                filters.sortBy === opt.value
                                  ? "bg-primary-50 text-primary-700 font-medium"
                                  : "text-neutral-700 hover:bg-neutral-50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile view toggle */}
                <div className="xl:hidden flex items-center rounded-lg border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setShowMapMobile(false)}
                    className={cn(
                      "p-1.5 transition-colors",
                      !showMapMobile
                        ? "bg-primary-600 text-white"
                        : "bg-white text-neutral-500 hover:text-neutral-700"
                    )}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowMapMobile(true)}
                    className={cn(
                      "p-1.5 transition-colors",
                      showMapMobile
                        ? "bg-primary-600 text-white"
                        : "bg-white text-neutral-500 hover:text-neutral-700"
                    )}
                    aria-label="Map view"
                  >
                    <Map className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            <ActiveFilters
              filters={filters}
              onChange={handleFiltersChange}
              className="mt-2"
              maxPrice={defaultMaxPrice}
              categories={filtersData?.categories ?? []}
            />
          </div>

          {/* Results body */}
          <div ref={resultsScrollRef} className="flex-1 min-h-0 overflow-visible lg:overflow-y-auto">
            {/* Mobile map */}
            {showMapMobile && (
              <div className="xl:hidden h-[50vh] border-b border-neutral-200">
                <SearchMapView
                  businesses={businesses}
                  selectedBusiness={selectedBusiness}
                  hoveredBusiness={hoveredBusiness}
                  onSelectBusiness={setSelectedBusiness}
                  onMapBoundsChange={handleMapBoundsChange}
                  userLocation={userLocation}
                  cityCenter={cityCenter}
                  className="h-full w-full"
                />
              </div>
            )}

            <div className="px-4 sm:px-6 py-4">
              {isError ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
                  <p className="text-red-500 mb-4">Failed to load results</p>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 lg:flex lg:flex-col gap-2 sm:gap-3 lg:gap-4"
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <ProviderCardSkeleton key={i} />
                      ))}
                    </motion.div>
                  ) : businesses.length === 0 ? (
                    <NoResults
                      onReset={resetFilters}
                      cities={filtersData?.cities}
                      categories={filtersData?.categories}
                      onSelectCity={(city) =>
                        handleFiltersChange({ ...filters, city, category: "" })
                      }
                      onSelectCategory={(catSlug) =>
                        handleFiltersChange({ ...filters, category: catSlug, city: "" })
                      }
                    />
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                    >
                      {businesses.map((business, index) => {
                        const imageUrl =
                          business.logo_url ||
                          (Array.isArray(business.image_urls) && business.image_urls[0]) ||
                          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";
                        const cuisineDisplay =
                          (business.cuisine_types && business.cuisine_types[0]) ||
                          business.category ||
                          "";
                        return (
                          <div
                            key={`${business.id}-${index}`}
                            className={cn(
                              "transition-all rounded-xl",
                              selectedBusiness?.id === business.id && "ring-2 ring-primary-500"
                            )}
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <RestaurantCard
                              name={business.name}
                              cuisine={cuisineDisplay}
                              city={business.city}
                              rating={business.average_rating}
                              reviewCount={business.total_reviews}
                              imageUrl={imageUrl}
                              priceRange={business.price_range ?? undefined}
                              slug={`/business/${business.slug}`}
                            />
                          </div>
                        );
                      })}

                      {/* Pagination (SEO: windowed series + crawlable links) */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          resultsScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        series={paginationSeries}
                        getPageUrl={buildSearchPageUrl}
                        className="pt-6 pb-4 border-t border-neutral-100 mt-4"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>

        {/* ── Right: Map ── */}
        <aside className="hidden xl:flex w-[38%] flex-shrink-0 border-l border-neutral-100 bg-white p-4 items-stretch relative">
          {/* Result count badge */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-full px-4 py-2 shadow-md text-sm font-semibold text-neutral-800">
              {totalCount.toLocaleString()} providers
            </div>
          </div>
          <SearchMapView
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            hoveredBusiness={hoveredBusiness}
            onSelectBusiness={setSelectedBusiness}
            onMapBoundsChange={handleMapBoundsChange}
            userLocation={userLocation}
            cityCenter={cityCenter}
            className="h-full w-full  overflow-hidden shadow-sm"
          />
        </aside>
      </div>

    </div>
  );
}

/* ──────────────────────── empty state ──────────────────────── */

function NoResults({
  onReset,
  cities,
  categories,
  onSelectCity,
  onSelectCategory,
}: {
  onReset: () => void;
  cities?: { name: string; slug: string; business_count: number }[];
  categories?: { name: string; slug: string; business_count: number }[];
  onSelectCity?: (city: string) => void;
  onSelectCategory?: (cat: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-2xl border border-neutral-100"
    >
      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="h-8 w-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No providers found</h3>
      <p className="text-neutral-500 mb-2 max-w-md mx-auto text-sm">
        Try adjusting your filters or explore a different location.
      </p>
      <p className="text-neutral-400 mb-6 max-w-md mx-auto text-xs">
        Or clear filters below to see all providers, or pick a city or category to browse.
      </p>

      {/* Suggested cities */}
      {cities && cities.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
            Popular Cities
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {cities.slice(0, 5).map((city) => (
              <button
                key={city.slug}
                onClick={() => onSelectCity?.(city.name)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested categories */}
      {categories && categories.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
            Popular Categories
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory?.(cat.slug)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" onClick={onReset}>
        <SlidersHorizontal className="h-4 w-4 mr-1.5" />
        Reset All Filters
      </Button>
    </motion.div>
  );
}
