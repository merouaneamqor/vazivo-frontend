"use client";

import { Filter, X, ChevronDown, Star, DollarSign, MapPin } from "lucide-react";

interface FiltersToolbarProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onMobileFiltersOpen: () => void;
}

export function FiltersToolbar({ filters, onFiltersChange, sortBy, onSortChange, onMobileFiltersOpen }: FiltersToolbarProps) {
  const hasActiveFilters = filters.categories.length > 0 || filters.rating > 0 || filters.instantBooking || filters.hasPromo;

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      date: null,
      priceMin: 0,
      priceMax: 1000,
      rating: 0,
      distance: 50,
      staff: [],
      instantBooking: false,
      hasPromo: false,
    });
  };

  return (
    <div className="lg:sticky lg:top-18 z-40 bg-white border-b border-neutral-200 py-2 sm:py-3 px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
        {/* Mobile Filters Button */}
        <button
          onClick={onMobileFiltersOpen}
          className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-neutral-200 rounded-lg sm:rounded-xl hover:bg-neutral-50 transition-colors whitespace-nowrap"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          <span className="text-xs sm:text-sm font-semibold">Filtres</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
              {filters.categories.length + (filters.rating > 0 ? 1 : 0) + (filters.instantBooking ? 1 : 0) + (filters.hasPromo ? 1 : 0)}
            </span>
          )}
        </button>

      {/* Desktop Filter Chips */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        {/* Categories */}
        <FilterChip
          icon={<ChevronDown className="w-4 h-4" />}
          label="Catégories"
          active={filters.categories.length > 0}
          count={filters.categories.length}
        />

        {/* Rating */}
        <FilterChip
          icon={<Star className="w-4 h-4" />}
          label="Note minimum"
          active={filters.rating > 0}
          badge={filters.rating > 0 ? `${filters.rating}★` : undefined}
        />

        {/* Price */}
        <FilterChip
          icon={<DollarSign className="w-4 h-4" />}
          label="Prix"
          active={filters.priceMin > 0 || filters.priceMax < 1000}
        />

        {/* Distance */}
        <FilterChip
          icon={<MapPin className="w-4 h-4" />}
          label="Distance"
          active={filters.distance < 50}
          badge={filters.distance < 50 ? `${filters.distance}km` : undefined}
        />

        {/* Instant Booking */}
        {filters.instantBooking && (
          <ActiveFilterChip
            label="Réservation instantanée"
            onRemove={() => onFiltersChange({ ...filters, instantBooking: false })}
          />
        )}

        {/* Promotions */}
        {filters.hasPromo && (
          <ActiveFilterChip
            label="Promotions"
            onRemove={() => onFiltersChange({ ...filters, hasPromo: false })}
          />
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap ml-auto px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-primary-50 rounded-lg sm:rounded-xl transition-colors"
        >
          Effacer
        </button>
      )}

      {/* Sort Dropdown */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 sm:px-4 py-2 border border-neutral-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <option value="relevance">Pertinence</option>
        <option value="distance">Distance</option>
        <option value="rating">Meilleures notes</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
    </div>
    </div>
  );
}

function FilterChip({ icon, label, active, count, badge }: any) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all whitespace-nowrap shadow-sm ${
        active
          ? "bg-primary-500 text-white border-primary-500"
          : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
      }`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
      {count > 0 && (
        <span className="w-6 h-6 bg-white text-primary-600 text-xs font-bold rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
      {badge && <span className="text-xs font-medium">{badge}</span>}
    </button>
  );
}

function ActiveFilterChip({ label, onRemove }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl border-2 border-primary-200 shadow-sm">
      <span className="text-sm font-semibold">{label}</span>
      <button onClick={onRemove} className="hover:bg-primary-100 rounded-lg p-1 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
