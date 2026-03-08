"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminProvidersFilters } from "@/types/admin";

const DEBOUNCE_MS = 300;

export function ProvidersFiltersBar({
  filters,
  onFiltersChange,
  categories,
  subCategories,
  cities,
  className,
}: {
  filters: AdminProvidersFilters;
  onFiltersChange: (next: AdminProvidersFilters) => void;
  categories: { name: string; slug: string }[];
  subCategories?: { name: string; slug: string }[];
  cities: { name: string; slug: string }[];
  className?: string;
}) {
  const t = useTranslations("adminProviders");
  const [searchInput, setSearchInput] = useState(filters.q ?? "");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    setSearchInput(filters.q ?? "");
  }, [filters.q]);

  const debouncedSetQ = useCallback(
    (value: string) => {
      const t = setTimeout(() => {
        onFiltersChange({ ...filters, q: value || undefined, page: 1 });
      }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    },
    [filters, onFiltersChange]
  );

  useEffect(() => {
    if (searchInput === (filters.q ?? "")) return;
    const cancel = debouncedSetQ(searchInput);
    return cancel;
  }, [searchInput]);

  const hasPrimaryFilters =
    (filters.q ?? "") !== "" ||
    (filters.category ?? "") !== "" ||
    (filters.city ?? "") !== "" ||
    (filters.status ?? "") !== "" ||
    (filters.verification_status ?? "") !== "" ||
    (filters.onboarding ?? "all") !== "all" ||
    (filters.premium_status ?? "") !== "" ||
    (filters.published ?? "") !== "" ||
    (filters.geo_validated ?? "") !== "" ||
    (filters.has_services ?? "") !== "" ||
    (filters.has_bookings ?? "") !== "" ||
    (filters.neighborhood ?? "") !== "";

  const hasAdvancedFilters =
    filters.min_rating != null ||
    filters.max_rating != null ||
    filters.no_show_threshold != null ||
    (filters.created_after ?? "") !== "" ||
    (filters.created_before ?? "") !== "" ||
    (filters.last_booking_after ?? "") !== "" ||
    (filters.last_booking_before ?? "") !== "" ||
    (filters.neighborhood ?? "") !== "";

  const hasActiveFilters = hasPrimaryFilters || hasAdvancedFilters;

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      page: 1,
      per_page: filters.per_page ?? 20,
    });
  };

  const update = (key: keyof AdminProvidersFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div
      className={
        "sticky top-0 z-10 border-b border-neutral-200 bg-white shadow-sm " + (className ?? "")
      }
    >
      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10  border-neutral-200"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <select
          value={filters.category ?? ""}
          onChange={(e) => update("category", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label={t("filterCategory")}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {subCategories && subCategories.length > 0 && (
          <select
            value={filters.subcategory ?? ""}
            onChange={(e) => update("subcategory", e.target.value || undefined)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
            aria-label="Subcategory"
          >
            <option value="">All Subcategories</option>
            {subCategories.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={filters.city ?? ""}
          onChange={(e) => update("city", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="City"
        >
          <option value="">{t("allCities")}</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filters.verification_status ?? ""}
          onChange={(e) => update("verification_status", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="Verification status"
        >
          <option value="">{t("allVerification")}</option>
          <option value="verified">{t("verified")}</option>
          <option value="pending">{t("pending")}</option>
        </select>
        <select
          value={filters.status ?? ""}
          onChange={(e) => update("status", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label={t("columnStatus")}
        >
          <option value="">{t("allStatuses")}</option>
          <option value="approved">{t("approved")}</option>
          <option value="suspended">{t("suspended")}</option>
        </select>
        <select
          value={filters.onboarding ?? "all"}
          onChange={(e) => {
            const v = e.target.value as "all" | "complete" | "incomplete";
            update("onboarding", v === "all" ? undefined : v);
          }}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label={t("sectionOnboarding")}
        >
          <option value="all">{t("allOnboarding")}</option>
          <option value="complete">{t("onboardingComplete")}</option>
          <option value="incomplete">{t("onboardingIncomplete")}</option>
        </select>
        <select
          value={filters.premium_status ?? ""}
          onChange={(e) => update("premium_status", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="Premium status"
        >
          <option value="">All Premium</option>
          <option value="active">Active Premium</option>
          <option value="expired">Expired</option>
          <option value="never">Never Premium</option>
        </select>
        <select
          value={filters.published ?? ""}
          onChange={(e) => update("published", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="Published status"
        >
          <option value="">All Published</option>
          <option value="yes">Published</option>
          <option value="no">Draft</option>
        </select>
        <select
          value={filters.geo_validated ?? ""}
          onChange={(e) => update("geo_validated", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="Geo validated"
        >
          <option value="">All Locations</option>
          <option value="yes">Geo Validated</option>
          <option value="no">Not Validated</option>
        </select>
        <select
          value={filters.has_services ?? ""}
          onChange={(e) => update("has_services", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="Has services"
        >
          <option value="">All Services</option>
          <option value="yes">Has Services</option>
          <option value="no">No Services</option>
        </select>
        <select
          value={filters.has_bookings ?? ""}
          onChange={(e) => update("has_bookings", e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm min-w-[120px] bg-white"
          aria-label="Has bookings"
        >
          <option value="">All Bookings</option>
          <option value="yes">Has Bookings</option>
          <option value="no">No Bookings</option>
        </select>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-neutral-600"
          >
            <X className="h-4 w-4 mr-1" />
            {t("clear")}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="text-neutral-600 ml-auto"
          aria-expanded={advancedOpen}
        >
          {advancedOpen ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          {t("advanced")}
        </Button>
      </div>
      {advancedOpen && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("neighborhood")}</span>
            <input
              type="text"
              value={filters.neighborhood ?? ""}
              onChange={(e) => update("neighborhood", e.target.value || undefined)}
              className="w-32 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              placeholder="Enter neighborhood"
              aria-label="Neighborhood"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("minRating")}</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={filters.min_rating ?? ""}
              onChange={(e) => update("min_rating", e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              aria-label="Minimum rating"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("maxRating")}</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={filters.max_rating ?? ""}
              onChange={(e) => update("max_rating", e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              aria-label="Maximum rating"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("noShowThreshold")}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={filters.no_show_threshold ?? ""}
              onChange={(e) =>
                update("no_show_threshold", e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-16 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              placeholder="10"
              aria-label="No-show threshold percent"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("createdAfter")}</span>
            <input
              type="date"
              value={filters.created_after ?? ""}
              onChange={(e) => update("created_after", e.target.value || undefined)}
              className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              aria-label="Created after date"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("createdBefore")}</span>
            <input
              type="date"
              value={filters.created_before ?? ""}
              onChange={(e) => update("created_before", e.target.value || undefined)}
              className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              aria-label="Created before date"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("lastBookingAfter")}</span>
            <input
              type="date"
              value={filters.last_booking_after ?? ""}
              onChange={(e) => update("last_booking_after", e.target.value || undefined)}
              className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              aria-label="Last booking after date"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <span>{t("lastBookingBefore")}</span>
            <input
              type="date"
              value={filters.last_booking_before ?? ""}
              onChange={(e) => update("last_booking_before", e.target.value || undefined)}
              className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm"
              aria-label="Last booking before date"
            />
          </label>
        </div>
      )}
    </div>
  );
}
