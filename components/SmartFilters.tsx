"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  MapPin,
  Tag,
  Star,
  DollarSign,
  Clock,
  X,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Slider } from "@/components/ui/slider";

interface FilterState {
  category?: string;
  city?: string;
  minRating?: number;
  priceRange?: [number, number];
  openNow?: boolean;
  sortBy?: "rating" | "distance" | "price_low" | "price_high" | "popular";
}

interface SmartFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: { name: string; slug: string; count?: number }[];
  cities: { name: string; slug: string; count?: number }[];
  priceRange?: { min: number; max: number };
  className?: string;
}

const sortOptions = [
  { value: "popular", label: "Most Popular", icon: Sparkles },
  { value: "rating", label: "Highest Rated", icon: Star },
  { value: "price_low", label: "Price: Low to High", icon: DollarSign },
  { value: "price_high", label: "Price: High to Low", icon: DollarSign },
  { value: "distance", label: "Nearest First", icon: MapPin },
];

export function SmartFilters({
  filters,
  onFiltersChange,
  categories,
  cities,
  priceRange = { min: 0, max: 1000 },
  className,
}: SmartFiltersProps) {
  const [showAllFilters, setShowAllFilters] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.city) count++;
    if (filters.minRating) count++;
    if (filters.priceRange) count++;
    if (filters.openNow) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const removeFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <>
      {/* Horizontal Filter Chips */}
      <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide pb-2", className)}>
        {/* All Filters Button */}
        <motion.button
          onClick={() => setShowAllFilters(true)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full",
            "border transition-all font-medium text-sm",
            activeFilterCount > 0
              ? "bg-primary-50 border-primary-200 text-primary-700"
              : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </motion.button>

        {/* Category Quick Filter */}
        <FilterChip
          label={filters.category || "Category"}
          icon={<Tag className="h-4 w-4" />}
          isActive={!!filters.category}
          onClick={() => setActiveFilter("category")}
          onClear={() => removeFilter("category")}
        />

        {/* City Quick Filter */}
        <FilterChip
          label={filters.city || "Location"}
          icon={<MapPin className="h-4 w-4" />}
          isActive={!!filters.city}
          onClick={() => setActiveFilter("city")}
          onClear={() => removeFilter("city")}
        />

        {/* Rating Quick Filter */}
        <FilterChip
          label={filters.minRating ? `${filters.minRating}+ ★` : "Rating"}
          icon={<Star className="h-4 w-4" />}
          isActive={!!filters.minRating}
          onClick={() => setActiveFilter("rating")}
          onClear={() => removeFilter("minRating")}
        />

        {/* Open Now Toggle */}
        <motion.button
          onClick={() => updateFilter("openNow", !filters.openNow)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full",
            "border transition-all font-medium text-sm",
            filters.openNow
              ? "bg-success-50 border-success-200 text-success-700"
              : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
          )}
        >
          <Clock className="h-4 w-4" />
          Open Now
          {filters.openNow && <Check className="h-4 w-4" />}
        </motion.button>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 py-2"
          >
            <span className="text-sm text-neutral-500">Active filters:</span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Bottom Sheet */}
      <BottomSheet
        isOpen={activeFilter === "category"}
        onClose={() => setActiveFilter(null)}
        title="Category"
        subtitle="Select a service category"
      >
        <div className="p-4 space-y-2">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => {
                updateFilter("category", category.name);
                setActiveFilter(null);
              }}
              className={cn(
                "w-full flex items-center justify-between p-4  transition-colors",
                filters.category === category.name
                  ? "bg-primary-50 text-primary-700 border border-primary-200"
                  : "bg-neutral-50 hover:bg-neutral-100"
              )}
            >
              <span className="font-medium">{category.name}</span>
              {category.count !== undefined && (
                <span className="text-sm text-neutral-500">{category.count}</span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* City Bottom Sheet */}
      <BottomSheet
        isOpen={activeFilter === "city"}
        onClose={() => setActiveFilter(null)}
        title="Location"
        subtitle="Choose a city"
      >
        <div className="p-4 space-y-2">
          {cities.map((city) => (
            <button
              key={city.slug}
              onClick={() => {
                updateFilter("city", city.name);
                setActiveFilter(null);
              }}
              className={cn(
                "w-full flex items-center justify-between p-4  transition-colors",
                filters.city === city.name
                  ? "bg-primary-50 text-primary-700 border border-primary-200"
                  : "bg-neutral-50 hover:bg-neutral-100"
              )}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span className="font-medium">{city.name}</span>
              </div>
              {city.count !== undefined && (
                <span className="text-sm text-neutral-500">{city.count} places</span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Rating Bottom Sheet */}
      <BottomSheet
        isOpen={activeFilter === "rating"}
        onClose={() => setActiveFilter(null)}
        title="Minimum Rating"
        subtitle="Show places with this rating or higher"
      >
        <div className="p-4 space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <button
              key={rating}
              onClick={() => {
                updateFilter("minRating", rating);
                setActiveFilter(null);
              }}
              className={cn(
                "w-full flex items-center justify-between p-4  transition-colors",
                filters.minRating === rating
                  ? "bg-primary-50 text-primary-700 border border-primary-200"
                  : "bg-neutral-50 hover:bg-neutral-100"
              )}
            >
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(rating)
                        ? "text-amber-400 fill-amber-400"
                        : i < rating
                        ? "text-amber-400 fill-amber-400 opacity-50"
                        : "text-neutral-300"
                    )}
                  />
                ))}
                <span className="ml-2 font-medium">{rating}+</span>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* All Filters Bottom Sheet */}
      <BottomSheet
        isOpen={showAllFilters}
        onClose={() => setShowAllFilters(false)}
        title="All Filters"
        snapPoints={[0.7, 0.9]}
      >
        <div className="p-4 space-y-6">
          {/* Sort By */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Sort By</h3>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter("sortBy", option.value)}
                  className={cn(
                    "flex items-center gap-2 p-3  transition-colors text-sm",
                    filters.sortBy === option.value
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "bg-neutral-50 hover:bg-neutral-100"
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Price Range</h3>
            <div className="px-2">
              <Slider
                defaultValue={filters.priceRange || [priceRange.min, priceRange.max]}
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
              />
              <div className="flex justify-between mt-2 text-sm text-neutral-500">
                <span>{filters.priceRange?.[0] || priceRange.min} MAD</span>
                <span>{filters.priceRange?.[1] || priceRange.max} MAD</span>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={() => setShowAllFilters(false)}
              className="w-full"
              size="lg"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

// Filter Chip Component
interface FilterChipProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  onClear?: () => void;
}

function FilterChip({ label, icon, isActive, onClick, onClear }: FilterChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full",
        "border transition-all font-medium text-sm",
        isActive
          ? "bg-primary-50 border-primary-200 text-primary-700"
          : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
      )}
    >
      {icon}
      <span className="max-w-[100px] truncate">{label}</span>
      {isActive && onClear ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-primary-200 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      ) : (
        <ChevronDown className="h-4 w-4 opacity-50" />
      )}
    </motion.button>
  );
}
