"use client";

import { X, Star, DollarSign, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FiltersDrawerMobileProps {
  open: boolean;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function FiltersDrawerMobile({ open, filters, onFiltersChange, onClose }: FiltersDrawerMobileProps) {
  if (!open) return null;

  const applyFilters = () => {
    onClose();
  };

  const resetFilters = () => {
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
    <div className="fixed inset-0 z-[9999] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-white">
          <h2 className="text-xl font-bold text-neutral-900">Filtres</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Categories */}
          <FilterSection icon={<Star className="w-5 h-5" />} title="Catégories">
            <div className="space-y-2">
              {["Coiffure", "Beauté", "Ongles", "Massage", "Spa"].map((cat) => (
                <label key={cat} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={(e) => {
                      const newCats = e.target.checked
                        ? [...filters.categories, cat]
                        : filters.categories.filter((c: string) => c !== cat);
                      onFiltersChange({ ...filters, categories: newCats });
                    }}
                    className="w-4 h-4 text-primary rounded-lg"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating */}
          <FilterSection icon={<Star className="w-5 h-5" />} title="Note minimum">
            <div className="flex gap-2">
              {[3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFiltersChange({ ...filters, rating: filters.rating === rating ? 0 : rating })}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition ${
                    filters.rating === rating
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-neutral-300"
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{rating}+</span>
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection icon={<DollarSign className="w-5 h-5" />} title="Prix">
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={filters.priceMax}
                onChange={(e) => onFiltersChange({ ...filters, priceMax: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-neutral-600">
                <span>{filters.priceMin} MAD</span>
                <span>{filters.priceMax} MAD</span>
              </div>
            </div>
          </FilterSection>

          {/* Distance */}
          <FilterSection icon={<MapPin className="w-5 h-5" />} title="Distance">
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="50"
                value={filters.distance}
                onChange={(e) => onFiltersChange({ ...filters, distance: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-neutral-600">{filters.distance} km</div>
            </div>
          </FilterSection>

          {/* Options */}
          <FilterSection icon={<Calendar className="w-5 h-5" />} title="Options">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Réservation instantanée</span>
                <input
                  type="checkbox"
                  checked={filters.instantBooking}
                  onChange={(e) => onFiltersChange({ ...filters, instantBooking: e.target.checked })}
                  className="w-4 h-4 text-primary rounded-lg"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Promotions actives</span>
                <input
                  type="checkbox"
                  checked={filters.hasPromo}
                  onChange={(e) => onFiltersChange({ ...filters, hasPromo: e.target.checked })}
                  className="w-4 h-4 text-primary rounded-lg"
                />
              </label>
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-200 flex gap-3 bg-white">
          <Button variant="outline" onClick={resetFilters} className="flex-1 h-12 font-semibold">
            Réinitialiser
          </Button>
          <Button onClick={applyFilters} className="flex-1 h-12 font-semibold">
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ icon, title, children }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 text-neutral-900">
        {icon}
        <h3 className="font-semibold text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}
