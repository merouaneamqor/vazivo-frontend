"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RangeSlider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSearchFilters } from "@/hooks/useSearchMetadata";

/* ──────────────────────── types ──────────────────────── */

export interface SearchFiltersState {
  category: string;
  city: string;
  minRating: number;
  priceRange: [number, number];
  availableToday: boolean;
  sortBy: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  onReset: () => void;
  className?: string;
  maxPrice?: number;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  /** Desktop: called when user wants to hide the filters sidebar */
  onCollapseSidebar?: () => void;
}

export const getDefaultFilters = (maxPrice: number = 500): SearchFiltersState => ({
  category: "",
  city: "",
  minRating: 0,
  priceRange: [0, maxPrice],
  availableToday: false,
  sortBy: "relevance",
});

const defaultFilters: SearchFiltersState = getDefaultFilters(500);

/* ──────────────────────── accordion section ──────────────────────── */

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-100 last:border-b-0 py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-700">
          {title}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────── filter content ──────────────────────── */

function FilterContent({
  filters,
  updateFilter,
  activeFilterCount,
  onReset,
}: {
  filters: SearchFiltersState;
  updateFilter: <K extends keyof SearchFiltersState>(key: K, value: SearchFiltersState[K]) => void;
  activeFilterCount: number;
  onReset: () => void;
}) {
  const { data: filtersData, isLoading } = useSearchFilters();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cities = filtersData?.cities || [];
  // Dedupe by slug (API may return duplicate slugs e.g. "Barber" vs "barber"); sum business_count
  const categories = (filtersData?.categories || []).reduce<
    Array<{ name: string; slug: string; business_count: number }>
  >((acc, cat) => {
    const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-") || "";
    const existing = acc.find((c) => (c.slug || "").toLowerCase() === slug.toLowerCase());
    if (existing) {
      existing.business_count += cat.business_count ?? 0;
      return acc;
    }
    acc.push({
      name: cat.name ?? slug,
      slug,
      business_count: cat.business_count ?? 0,
    });
    return acc;
  }, []);
  const priceRange = filtersData?.price_range || { min: 0, max: 500 };
  const showLoading = !isMounted || isLoading;

  return (
    <div>
      {/* ── Category ── */}
      <FilterSection title="Category">
        {showLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() =>
                  updateFilter("category", filters.category === cat.slug ? "" : cat.slug)
                }
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                  filters.category === cat.slug
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-primary-200 hover:bg-primary-50/50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </FilterSection>

      {/* ── City / Area ── */}
      <FilterSection title="City / Area">
        {showLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city.slug}
                onClick={() =>
                  updateFilter("city", filters.city === city.name ? "" : city.name)
                }
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                  filters.city === city.name
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-primary-200 hover:bg-primary-50/50"
                )}
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </FilterSection>

      {/* ── Price Range ── */}
      <FilterSection title="Price Range">
        <RangeSlider
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          value={filters.priceRange}
          onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
          formatLabel={(v) => `$${v}`}
        />
      </FilterSection>

      {/* ── Rating ── */}
      <FilterSection title="Rating">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 0, label: "Any" },
            { value: 3, label: "3+" },
            { value: 3.5, label: "3.5+" },
            { value: 4, label: "4+" },
            { value: 4.5, label: "4.5+" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateFilter("minRating", filters.minRating === value ? 0 : value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                filters.minRating === value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-primary-200 hover:bg-primary-50/50"
              )}
            >
              {value > 0 && <Star className="h-3.5 w-3.5 fill-current flex-shrink-0" />}
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Availability ── */}
      <FilterSection title="Availability">
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer group py-1">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                Available today
              </span>
            </div>
            <Switch
              checked={filters.availableToday}
              onCheckedChange={(checked) => updateFilter("availableToday", checked)}
            />
          </label>
        </div>
      </FilterSection>

      {/* ── Reset ── */}
      {activeFilterCount > 0 && (
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full text-sm rounded-lg border-neutral-200 hover:bg-neutral-50"
            size="sm"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── main component ──────────────────────── */

export default function SearchFilters({
  filters,
  onChange,
  onReset,
  className,
  maxPrice = 500,
  mobileOpen,
  onMobileOpenChange,
  onCollapseSidebar,
}: SearchFiltersProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileControlled = mobileOpen !== undefined && onMobileOpenChange !== undefined;
  const showMobileFilters = isMobileControlled ? mobileOpen : internalMobileOpen;
  const setShowMobileFilters = isMobileControlled ? onMobileOpenChange : setInternalMobileOpen;

  const activeFilterCount = [
    filters.category,
    filters.city,
    filters.minRating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice,
    filters.availableToday,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof SearchFiltersState>(
    key: K,
    value: SearchFiltersState[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <div className={cn("hidden lg:block", className)}>
        <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          <div className="pr-1">
            {/* Header: title + optional collapse + active count */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-neutral-900">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {onCollapseSidebar && (
                <button
                  type="button"
                  onClick={onCollapseSidebar}
                  className="flex-shrink-0 p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  aria-label="Hide filters"
                >
                  <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </button>
              )}
            </div>

            <FilterContent
              filters={filters}
              updateFilter={updateFilter}
              activeFilterCount={activeFilterCount}
              onReset={onReset}
            />
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Button ─── */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMobileFilters(true)}
          className="gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 overflow-y-auto lg:hidden shadow-2xl"
            >
              {/* Drawer header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-5 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="default" size="sm">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              {/* Drawer content */}
              <div className="px-5 py-4">
                <FilterContent
                  filters={filters}
                  updateFilter={updateFilter}
                  activeFilterCount={activeFilterCount}
                  onReset={onReset}
                />
              </div>

              {/* Drawer footer */}
              <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-5 py-4">
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  Show Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ──────────────────────── active filters pills ──────────────────────── */

interface ActiveFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  className?: string;
  maxPrice?: number;
  /** Resolve category slug to localized display name */
  categories?: Array<{ slug: string; name: string }>;
}

export function ActiveFilters({
  filters,
  onChange,
  className,
  maxPrice = 500,
  categories = [],
}: ActiveFiltersProps) {
  const activeFilters: { key: keyof SearchFiltersState; label: string; value: string }[] = [];

  if (filters.category) {
    const displayName = categories.find((c) => c.slug === filters.category)?.name ?? filters.category;
    activeFilters.push({ key: "category", label: "Category", value: displayName });
  }
  if (filters.city) {
    activeFilters.push({ key: "city", label: "City", value: filters.city });
  }
  if (filters.minRating > 0) {
    activeFilters.push({ key: "minRating", label: "Rating", value: `${filters.minRating}+` });
  }
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
    activeFilters.push({
      key: "priceRange",
      label: "Price",
      value: `$${filters.priceRange[0]} – $${filters.priceRange[1]}`,
    });
  }
  if (filters.availableToday) {
    activeFilters.push({ key: "availableToday", label: "Available", value: "Today" });
  }

  if (activeFilters.length === 0) return null;

  const removeFilter = (key: keyof SearchFiltersState) => {
    const newFilters = { ...filters };
    if (key === "priceRange") newFilters.priceRange = [0, maxPrice];
    else if (key === "minRating") newFilters.minRating = 0;
    else if (key === "availableToday") newFilters.availableToday = false;
    else if (key === "category") newFilters.category = "";
    else if (key === "city") newFilters.city = "";
    else if (key === "sortBy") newFilters.sortBy = "relevance";
    onChange(newFilters);
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {activeFilters.map(({ key, label, value }) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs border border-primary-100"
        >
          <span className="text-primary-500">{label}:</span>
          <span className="font-medium">{value}</span>
          <button
            onClick={() => removeFilter(key)}
            className="ml-0.5 p-0.5 hover:bg-primary-100 rounded-full"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
