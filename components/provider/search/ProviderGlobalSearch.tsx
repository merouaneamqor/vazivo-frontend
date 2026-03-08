"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { useProviderSearch } from "@/lib/provider-search-api";
import {
  BookingResult,
  CustomerResult,
  ServiceResult,
  StaffResult,
  BusinessResult,
  ReviewResult,
  ShortcutResult,
} from "./SearchResults";

const DEBOUNCE_MS = 200;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface ProviderGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProviderGlobalSearch({ isOpen, onClose }: ProviderGlobalSearchProps) {
  const t = useTranslations("providerSearch");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  const { data, isLoading, isError, error, refetch } = useProviderSearch(debouncedQuery, isOpen);

  const allResults = useMemo(() => {
    if (!data) return [];
    return [
      ...data.shortcuts.map((item) => ({ type: "shortcut" as const, item })),
      ...data.bookings.map((item) => ({ type: "booking" as const, item })),
      ...data.customers.map((item) => ({ type: "customer" as const, item })),
      ...data.services.map((item) => ({ type: "service" as const, item })),
      ...data.staff.map((item) => ({ type: "staff" as const, item })),
      ...data.businesses.map((item) => ({ type: "business" as const, item })),
      ...data.reviews.map((item) => ({ type: "review" as const, item })),
    ];
  }, [data]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [allResults.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(allResults[selectedIndex]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allResults, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (result: (typeof allResults)[0]) => {
      const { type, item } = result;
      switch (type) {
        case "booking":
          router.push(`/provider/bookings?booking=${item.id}`);
          break;
        case "customer":
          router.push(`/provider/customers?id=${item.id}`);
          break;
        case "service":
          router.push(`/provider/services?id=${item.id}`);
          break;
        case "staff":
          router.push(`/provider/staff?id=${item.id}`);
          break;
        case "business":
          router.push(`/provider/businesses/${item.id}`);
          break;
        case "review":
          router.push(`/provider/reviews`);
          break;
        case "shortcut":
          router.push(item.href);
          break;
      }
      onClose();
    },
    [router, onClose]
  );

  const hasResults = data && Object.values(data).some((arr) => Array.isArray(arr) && arr.length > 0);
  const showShortcutsOnly = !debouncedQuery.trim() && data?.shortcuts?.length;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            style={{ zIndex: 2147483646 }}
            onClick={onClose}
            aria-hidden
          />
          <div
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 2147483647 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 overflow-hidden max-h-[85vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 md:px-5 py-4 border-b border-neutral-200 bg-neutral-50/50">
                <Search className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 text-base text-neutral-900 placeholder:text-neutral-500 outline-none bg-transparent min-w-0"
                  autoFocus
                  aria-label={t("ariaSearch")}
                />
                {isLoading && <Loader2 className="h-4 w-4 text-neutral-400 animate-spin flex-shrink-0" />}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label={t("ariaClose")}
                >
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                {isError ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">{t("searchFailed")}</p>
                    <p className="text-sm text-neutral-500 text-center mb-4">
                      {error instanceof Error ? error.message : t("tryAgain")}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      {t("retry")}
                    </button>
                  </div>
                ) : isLoading && !data ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
                    <p className="text-sm text-neutral-500">{t("searching")}</p>
                  </div>
                ) : !hasResults && !showShortcutsOnly ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">{t("noResults")}</p>
                    <p className="text-sm text-neutral-500 text-center">
                      {debouncedQuery.trim()
                        ? t("noMatches", { query: debouncedQuery })
                        : t("typeToSearch")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.shortcuts.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {showShortcutsOnly ? t("popular") : t("shortcuts")}
                        </div>
                        <div className="space-y-1">
                          {data.shortcuts.map((shortcut) => {
                            const idx = allResults.findIndex((r) => r.type === "shortcut" && r.item === shortcut);
                            return (
                              <ShortcutResult
                                key={shortcut.id}
                                shortcut={shortcut}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "shortcut", item: shortcut })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {data.bookings.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {t("bookings")}
                        </div>
                        <div className="space-y-1">
                          {data.bookings.map((booking) => {
                            const idx = allResults.findIndex((r) => r.type === "booking" && r.item === booking);
                            return (
                              <BookingResult
                                key={booking.id}
                                booking={booking}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "booking", item: booking })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {data.customers.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {t("customers")}
                        </div>
                        <div className="space-y-1">
                          {data.customers.map((customer) => {
                            const idx = allResults.findIndex((r) => r.type === "customer" && r.item === customer);
                            return (
                              <CustomerResult
                                key={customer.id}
                                customer={customer}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "customer", item: customer })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {data.services.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {t("services")}
                        </div>
                        <div className="space-y-1">
                          {data.services.map((service) => {
                            const idx = allResults.findIndex((r) => r.type === "service" && r.item === service);
                            return (
                              <ServiceResult
                                key={service.id}
                                service={service}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "service", item: service })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {data.staff.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {t("staff")}
                        </div>
                        <div className="space-y-1">
                          {data.staff.map((staff) => {
                            const idx = allResults.findIndex((r) => r.type === "staff" && r.item === staff);
                            return (
                              <StaffResult
                                key={staff.id}
                                staff={staff}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "staff", item: staff })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {data.businesses.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {t("businesses")}
                        </div>
                        <div className="space-y-1">
                          {data.businesses.map((business) => {
                            const idx = allResults.findIndex((r) => r.type === "business" && r.item === business);
                            return (
                              <BusinessResult
                                key={business.id}
                                business={business}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "business", item: business })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {data.reviews.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                          {t("reviews")}
                        </div>
                        <div className="space-y-1">
                          {data.reviews.map((review) => {
                            const idx = allResults.findIndex((r) => r.type === "review" && r.item === review);
                            return (
                              <ReviewResult
                                key={review.id}
                                review={review}
                                isSelected={selectedIndex === idx}
                                onClick={() => handleSelect({ type: "review", item: review })}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 md:px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-center text-xs text-neutral-500 flex-shrink-0">
                <span>{t("footerHint")}</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
