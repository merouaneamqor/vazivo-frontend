"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  CreditCard,
  Wifi,
  ChevronRight,
  X,
  Sparkles,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormattedText } from "@/components/FormattedText";
import { cn, formatPrice } from "@/lib/utils";
import type { Service } from "@/types";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServiceSectionProps {
  services: Service[];
  businessName: string;
  onBook: (service: Service) => void;
  loading?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const ALL_CATEGORY = "__all__";

type LocalServiceCategory = {
  id: string;
  name: string;
  color: string;
  services: Service[];
};

/** @deprecated; kept for bundle compatibility. */
function getUniqueCategories(services: Service[]): string[] {
  const cats = getServiceCategories(services);
  return cats.map((c) => c.name);
}

function getServiceCategories(services: Service[]): LocalServiceCategory[] {
  const categoryMap = new Map<string, LocalServiceCategory>();

  for (const service of services) {
    if (service.service_category_id && service.service_category) {
      const key = String(service.service_category_id);
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          id: key,
          name: service.service_category.name,
          color: service.service_category.color || "#3B82F6",
          services: [],
        });
      }
      categoryMap.get(key)!.services.push(service);
    }
  }

  return Array.from(categoryMap.values());
}

function getServiceDisplayName(service: Service): string {
  return service.category_name || service.name;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY TABS
   ═══════════════════════════════════════════════════════════════════════════ */

interface CategoryTabsProps {
  serviceCategories: Array<Pick<LocalServiceCategory, "id" | "name" | "color">>;
  active: string;
  onChange: (key: string) => void;
}

function CategoryTabs({ serviceCategories, active, onChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = useMemo(
    () => [
      { key: ALL_CATEGORY, label: "Tous" },
      ...serviceCategories.map((c) => ({ key: c.id, label: c.name })),
    ],
    [serviceCategories]
  );

  if (serviceCategories.length === 0) return null;

  return (
    <div className="relative -mx-4 sm:mx-0">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-0 py-1"
        role="tablist"
        aria-label="Service categories"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative flex-shrink-0 rounded-full px-4 h-9 text-sm font-medium transition-all duration-200 outline-none inline-flex items-center",
                "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                isActive
                  ? "text-white"
                  : "text-neutral-600 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="activeServiceTab"
                  className="absolute inset-0 rounded-full bg-neutral-900"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE CARD
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  selected: boolean;
  onSelect: (service: Service) => void;
  index: number;
}

function ServiceCard({ service, onBook, selected, onSelect, index }: ServiceCardProps) {
  const price = service.formatted_price || formatPrice(service.price);
  const duration = service.formatted_duration || formatDuration(service.duration);
  const displayName = getServiceDisplayName(service);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      layout
      className={cn(
        "group relative rounded-xl border bg-white p-3 md:p-4 transition-all duration-200 cursor-pointer",
        selected
          ? "border-primary-500 ring-2 ring-primary-500/20 shadow-md"
          : "border-neutral-200 shadow-sm hover:shadow-md"
      )}
      onClick={() => onSelect(service)}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${displayName}, ${duration}, ${price}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(service);
        }
      }}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-4 left-4 h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
          selected
            ? "border-primary-600 bg-primary-600"
            : "border-neutral-300 bg-white group-hover:border-neutral-400"
        )}
        aria-hidden
      >
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-3 w-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </div>

      <div className="flex justify-between items-start gap-4 pl-8">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-neutral-900 leading-tight">
            {displayName}
          </h3>

          {service.description && (
            <p className="mt-1 text-sm text-neutral-500 line-clamp-2 leading-relaxed">
              <FormattedText text={service.description} as="span" />
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
              <Clock className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
              {duration}
            </span>
            {service.parent_category_name && (
              <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                <Tag className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
                {service.parent_category_name}
              </span>
            )}
          </div>
        </div>

        {/* Right: price + book */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-base md:text-lg font-semibold text-neutral-900 tabular-nums">
            {price}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook(service);
            }}
            className="h-8 px-3 rounded-lg text-xs md:text-sm font-medium border border-primary-500 text-primary-600 hover:bg-primary-50 transition-colors"
            aria-label={`Réserver ${displayName}`}
          >
            Book
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE CARD SKELETON
   ═══════════════════════════════════════════════════════════════════════════ */

function ServiceCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl border border-neutral-200 bg-white rounded-xl p-3 md:p-4 shadow-sm"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STICKY CTA BAR
   ═══════════════════════════════════════════════════════════════════════════ */

interface StickyCTAProps {
  service: Service | null;
  onContinue: () => void;
  onClear: () => void;
}

function StickyCTA({ service, onContinue, onClear }: StickyCTAProps) {
  return (
    <AnimatePresence>
      {service && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom"
        >
          <div className="bg-white rounded-xl/95 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
              <div className="flex items-center gap-2.5">
                {/* Service info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-500 shrink-0 animate-pulse" aria-hidden />
                    <p className="text-xs md:text-sm font-semibold text-neutral-900 truncate">
                      {getServiceDisplayName(service)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-500">
                      {service.formatted_duration || formatDuration(service.duration)}
                    </span>
                    <span className="text-xs font-semibold text-neutral-700">
                      {service.formatted_price || formatPrice(service.price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors shrink-0"
                  aria-label="Deselect service"
                >
                  <X className="h-4 w-4" />
                </button>
                <Button
                  size="sm"
                  onClick={onContinue}
                  className="font-semibold px-4 shadow-sm hover:shadow-md active:scale-[0.97] transition-all"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN SECTION COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ServiceSection({
  services,
  businessName,
  onBook,
  loading = false,
}: ServiceSectionProps) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Keep getUniqueCategories in bundle for compatibility (tabs use serviceCategories)
  const categories = useMemo(() => getUniqueCategories(services), [services]);
  const serviceCategories = useMemo(() => getServiceCategories(services), [services]);

  const filteredServices = useMemo(() => {
    if (activeCategory === ALL_CATEGORY || serviceCategories.length === 0) return services;
    const category = serviceCategories.find((c) => c.id === activeCategory);
    return category ? category.services : [];
  }, [services, activeCategory, serviceCategories]);

  const displayedCategories = useMemo(() => {
    if (serviceCategories.length === 0) return [];
    if (activeCategory === ALL_CATEGORY) return serviceCategories;
    return serviceCategories.filter((c) => c.id === activeCategory);
  }, [serviceCategories, activeCategory]);

  const activeCategoryName =
    activeCategory !== ALL_CATEGORY && serviceCategories.length > 0
      ? serviceCategories.find((c) => c.id === activeCategory)?.name
      : null;

  const handleSelect = useCallback(
    (service: Service) => {
      setSelectedService((prev) => (prev?.id === service.id ? null : service));
    },
    []
  );

  const handleContinue = useCallback(() => {
    if (selectedService) onBook(selectedService);
  }, [selectedService, onBook]);

  const handleClear = useCallback(() => {
    setSelectedService(null);
  }, []);

  // Reset selection when category changes
  useEffect(() => {
    setSelectedService(null);
  }, [activeCategory]);

  if (!loading && services.length === 0) {
    return (
      <section ref={sectionRef} aria-labelledby="services-heading" id="services">
        <SectionHeader businessName={businessName} serviceCount={0} />
        <div className=" border border-neutral-100 bg-neutral-50 p-4 md:p-6 lg:p-10 text-center">
          <Sparkles className="h-8 w-8 text-neutral-300 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-neutral-500">
            Aucune prestation disponible pour le moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section ref={sectionRef} aria-labelledby="services-heading" id="services">
        <SectionHeader businessName={businessName} serviceCount={services.length} />

        {/* Category Tabs — by service category (e.g. Hair, Nails), not sub-category */}
        {!loading && (
          <div className="mb-4">
            <CategoryTabs
              serviceCategories={serviceCategories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        )}

        {/* Service List - Grouped by Service Category */}
        {serviceCategories.length > 0 ? (
          <div className="space-y-8">
            {displayedCategories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className="text-sm text-gray-500">({category.services.length})</span>
                </div>
                <div className="space-y-3" role="list">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <ServiceCardSkeleton key={i} index={i} />
                    ))
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {category.services.map((service, i) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          onBook={onBook}
                          selected={selectedService?.id === service.id}
                          onSelect={handleSelect}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Available services">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ServiceCardSkeleton key={i} index={i} />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service, i) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBook={onBook}
                    selected={selectedService?.id === service.id}
                    onSelect={handleSelect}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Results summary */}
        {!loading && filteredServices.length > 0 && (
          <p className="mt-3 text-xs text-neutral-400 text-center" aria-live="polite">
            {filteredServices.length} prestation{filteredServices.length > 1 ? "s" : ""}{" "}
            {activeCategoryName ? `dans ${activeCategoryName}` : "disponible" + (filteredServices.length > 1 ? "s" : "")}
          </p>
        )}
      </section>

      {/* Sticky CTA */}
      <StickyCTA
        service={selectedService}
        onContinue={handleContinue}
        onClear={handleClear}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionHeader({
  businessName,
  serviceCount,
}: {
  businessName: string;
  serviceCount: number;
}) {
  return (
    <header className="border-b border-neutral-100 -mx-4 px-4 py-3 mb-4 lg:mb-5">
      <h2
        id="services-heading"
        className="text-xl md:text-2xl font-semibold text-neutral-900 tracking-tight"
      >
        Prestations
      </h2>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <Wifi className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          Réservation en ligne disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
          Paiement sur place
        </span>
        {serviceCount > 0 && (
          <span className="text-neutral-400">
            {serviceCount} prestation{serviceCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </header>
  );
}
