"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, addDays, startOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import { MapPin, ChevronLeft, ChevronRight, Banknote, Clock } from "lucide-react";
import { CompactRating } from "@/components/ui/rating-stars";
import { AvailableBadge, CategoryBadge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useBusinessAvailability } from "@/hooks/useBookings";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Business } from "@/types";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

function formatPrice(price: number): string {
  return new Intl.NumberFormat(
    typeof process.env.NEXT_PUBLIC_CURRENCY_LOCALE === "string" ? process.env.NEXT_PUBLIC_CURRENCY_LOCALE : "fr-MA",
    { style: "currency", currency: typeof process.env.NEXT_PUBLIC_CURRENCY === "string" ? process.env.NEXT_PUBLIC_CURRENCY : "MAD" }
  ).format(price);
}

const SLOTS_PER_DAY = 4;
const DAYS_IN_WEEK = 7;

interface BusinessAvailabilityStripProps {
  businessSlug: string;
  business?: Business;
  businessBasePath?: string;
  onSlotSelect?: (business: Business, date: string, time: string) => void;
}

function BusinessAvailabilityStrip({ businessSlug, business, businessBasePath, onSlotSelect }: BusinessAvailabilityStripProps) {
  const baseHref = businessBasePath ?? `/business/${businessSlug}`;
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(addDays(weekStart, DAYS_IN_WEEK - 1), "yyyy-MM-dd");
  const { data, isLoading, isError } = useBusinessAvailability(businessSlug, startDate, endDate);
  const calendar = data?.calendar ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-16 w-14 rounded-lg bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Link
        href={business ? baseHref : `/business/${businessSlug}`}
        onClick={(e) => e.stopPropagation()}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        See availability
      </Link>
    );
  }

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const calendarByDate = new Map((data?.calendar ?? []).map((day) => [day.date, day]));

  const columns: { dayLabel: string; dateStr: string; date: string; slots: { time: string; available?: boolean }[]; isPast: boolean }[] = [];
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const isPast = dateStr < todayStr;
    const day = calendarByDate.get(dateStr);
    const availableSlots = day?.slots?.filter((s) => s.available) ?? [];
    const isToday = dateStr === todayStr;
    const slotsToShow = isToday
      ? availableSlots.filter((s) => {
          const [h, m] = s.time.split(":").map(Number);
          const slotTime = new Date(now);
          slotTime.setHours(h, m, 0, 0);
          return slotTime > now;
        })
      : availableSlots;
    const displaySlots = slotsToShow.slice(0, SLOTS_PER_DAY);
    columns.push({
      dayLabel: format(date, "EEE"),
      dateStr: format(date, "d MMM"),
      date: dateStr,
      slots: displaySlots,
      isPast,
    });
  }

  const maxSlots = Math.max(...columns.map((c) => c.slots.length), 1);

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setWeekOffset((o) => o - 1); }}
          disabled={weekOffset <= -4}
          className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px] text-neutral-500 min-w-[140px] text-center">
          {columns[0]?.dayLabel} {columns[0]?.dateStr} – {columns[columns.length - 1]?.dayLabel} {columns[columns.length - 1]?.dateStr}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setWeekOffset((o) => o + 1); }}
          className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-[11px]" role="grid" aria-label="Available times">
          <thead>
            <tr className="border-b border-neutral-200">
              {columns.map(({ dayLabel, dateStr, date, isPast }) => (
                <th key={date} className={cn("px-1 py-1.5 text-center", isPast && "opacity-60")}>
                  <span className={cn("block font-semibold", isPast ? "text-neutral-500" : "text-neutral-900")}>{dayLabel}</span>
                  <span className={cn("block font-normal", isPast ? "text-neutral-400" : "text-neutral-500")}>{dateStr}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxSlots }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-neutral-100 last:border-b-0">
                {columns.map(({ date, slots }) => {
                  const slot = slots[rowIndex];
                  if (!slot)
                    return (
                      <td key={date} className="p-1 text-center text-neutral-300">—</td>
                    );
                  return (
                    <td key={date} className="p-1 align-middle">
                      {onSlotSelect && business ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSlotSelect(business, date, slot.time);
                          }}
                          className="block w-full text-center min-h-[26px] leading-6 rounded-lg bg-primary-50 border border-primary-200 px-1.5 py-0.5 text-[11px] font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          {slot.time}
                        </button>
                      ) : (
                        <Link
                          href={business ? `${baseHref}?date=${date}&time=${slot.time}` : `/business/${businessSlug}?date=${date}&time=${slot.time}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full text-center min-h-[26px] leading-6 rounded-lg bg-primary-50 border border-primary-200 px-1.5 py-0.5 text-[11px] font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          {slot.time}
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={business ? baseHref : `/business/${businessSlug}`}
        onClick={(e) => e.stopPropagation()}
        className="text-center text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        See more slots
      </Link>
    </div>
  );
}

interface BusinessPreviewCardProps {
  business: Business;
  index?: number;
  variant?: "default" | "compact" | "featured" | "listRow";
  showAvailable?: boolean;
  onSlotSelect?: (business: Business, date: string, time: string) => void;
}

export default function BusinessPreviewCard({
  business,
  index = 0,
  variant = "default",
  showAvailable = false,
  onSlotSelect,
}: BusinessPreviewCardProps) {
  const displayStr = (value: unknown): string => {
    if (typeof value === "string" && value) return value;
    if (value && typeof value === "object" && "name" in value && typeof (value as { name: unknown }).name === "string")
      return (value as { name: string }).name;
    return "";
  };

  const toSlug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z-]/g, "") || "all";
  const businessHref =
    `/${displayStr(business?.city) ? toSlug(displayStr(business.city)) : "all"}` +
    `/${displayStr(business?.category) ? toSlug(displayStr(business.category)) : "all"}` +
    `/${typeof business?.slug === "string" && business.slug ? business.slug : "all"}`;

  if (!business || !business.id || !business.name) {
    return null;
  }

  const defaultPlaceholderImage = "/masscotte.png";
  const imageUrl = business.logo_url || business.image_urls?.[0] || defaultPlaceholderImage;
  const priceRange = business.min_price && business.max_price
    ? `${formatPrice(business.min_price)} - ${formatPrice(business.max_price)}`
    : business.min_price
    ? `From ${formatPrice(business.min_price)}`
    : null;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link href={businessHref}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex gap-3 p-3 bg-white rounded-xl border border-neutral-100 hover:border-primary-200 hover:shadow-md transition-all"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={imageUrl}
                alt={business.name}
                fill
                sizes="80px"
                loader={cloudinaryLoader}
                className="object-cover object-center"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 truncate" title={business.name}>{business.name}</h3>
              <p className="text-sm text-neutral-500 truncate" title={displayStr(business.city)}>{displayStr(business.city)}</p>
              <CompactRating rating={business.average_rating} count={business.total_reviews} />
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "listRow") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
      >
        <Link
          href={businessHref}
          className="flex sm:flex-col gap-3 sm:w-[32%] min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-40 sm:w-56 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-primary-50">
            <Image
              src={imageUrl}
              alt={business.name}
              fill
              sizes="224px"
              loader={cloudinaryLoader}
              className="object-cover object-center"
            />
          </div>
          <div className="flex-1 min-w-0 sm:flex-none">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-sm text-primary-600 hover:text-primary-700 truncate" title={business.name}>
                {business.name}
              </h3>
              {showAvailable && business.is_open && (
                <AvailableBadge className="!text-[10px] !px-1.5 !py-0 shrink-0" />
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">{displayStr(business.category)}</p>
            <div className="mt-1.5 flex items-start gap-1.5 text-neutral-700">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs">
                {business.address ? (
                  <>
                    <span className="block">{business.address}</span>
                    <span className="block text-neutral-500">{displayStr(business.city)}</span>
                  </>
                ) : (
                  displayStr(business.city)
                )}
              </span>
            </div>
            {priceRange && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-600">
                <Banknote className="h-3.5 w-3.5 text-neutral-400" />
                <span>{priceRange}</span>
              </div>
            )}
            <div className="mt-1.5 sm:mt-2">
              <CompactRating rating={business.average_rating} count={business.total_reviews} />
            </div>
          </div>
        </Link>

        <div className="flex-1 min-w-0 border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 sm:pl-4">
          <BusinessAvailabilityStrip businessSlug={business.slug} business={business} businessBasePath={businessHref} onSlotSelect={onSlotSelect} />
        </div>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="h-full"
      >
        <Link href={businessHref} className="block h-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card-premium overflow-hidden group h-full flex flex-col bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative h-48 sm:h-52 flex-shrink-0 overflow-hidden">
              <Image
                src={imageUrl}
                alt={business.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                loader={cloudinaryLoader}
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <CategoryBadge
                  category={business.category}
                  className="!rounded-lg max-w-[120px] truncate"
                />
                {showAvailable && business.is_open && (
                  <AvailableBadge className="!rounded-lg !text-[11px] !px-2 !py-0.5" />
                )}
              </div>

              <FavoriteButton
                business={business}
                variant="overlay"
                size="sm"
                className="bottom-3 right-3"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-start justify-between gap-2 mb-2 min-h-0">
                <h3
                  className="font-display font-semibold text-lg text-neutral-900 line-clamp-1 min-w-0"
                  title={business.name}
                >
                  {business.name}
                </h3>
                <CompactRating rating={business.average_rating} count={business.total_reviews} className="flex-shrink-0" />
              </div>

              <p
                className="flex items-center gap-1.5 text-sm text-neutral-500 mb-2 line-clamp-2 min-h-0"
                title={business.address ? `${business.address}${displayStr(business.city) ? `, ${displayStr(business.city)}` : ""}` : displayStr(business.city)}
              >
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                <span className="truncate">{business.address ? `${business.address}${displayStr(business.city) ? `, ${displayStr(business.city)}` : ""}` : displayStr(business.city)}</span>
              </p>

              <div className="text-sm text-neutral-600 line-clamp-2 mb-3 min-h-[2.5rem]">
                {business.description || "\u00A0"}
              </div>

              <div className="flex items-center justify-between pt-3 mt-auto border-t border-neutral-100 flex-shrink-0">
                {priceRange && (
                  <span className="text-sm font-medium text-neutral-700 truncate min-w-0">{priceRange}</span>
                )}
                {business.today_hours && (
                  <span className="flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {business.today_hours.open} - {business.today_hours.close}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={businessHref}>
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
          whileTap={{ scale: 0.98 }}
          className="overflow-hidden group bg-white rounded-xl border border-neutral-100 shadow-sm hover:border-neutral-200 transition-all duration-300"
        >
          <div className="relative h-48 overflow-hidden">
            <Image
              src={imageUrl}
              alt={business.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              loader={cloudinaryLoader}
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <CategoryBadge
                category={business.category}
                className="!rounded-lg max-w-[120px] truncate shrink-0"
              />
              {showAvailable && business.is_open && (
                <AvailableBadge className="!rounded-lg !text-[11px] !px-2 !py-0.5 shrink-0" />
              )}
            </div>

            <FavoriteButton
              business={business}
              variant="overlay"
              size="sm"
              className="bottom-3 right-3"
            />
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5 min-h-0">
              <h3
                className="font-display font-semibold text-neutral-900 line-clamp-1 min-w-0"
                title={business.name}
              >
                {business.name}
              </h3>
              <CompactRating
                rating={business.average_rating}
                count={business.total_reviews}
                className="flex-shrink-0 text-xs"
              />
            </div>

            <p
              className="flex items-center gap-1.5 text-sm text-neutral-500 mb-2 min-w-0"
              title={business.address ? `${business.address}${displayStr(business.city) ? `, ${displayStr(business.city)}` : ""}` : displayStr(business.city)}
            >
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
              <span className="truncate">
                {business.address ? (
                  <>{business.address}{displayStr(business.city) ? `, ${displayStr(business.city)}` : ""}</>
                ) : (
                  displayStr(business.city)
                )}
              </span>
            </p>

            {priceRange && (
              <p className="text-sm font-medium text-neutral-700">
                {priceRange}
              </p>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

interface BusinessGridProps {
  businesses: Business[];
  variant?: "default" | "compact" | "featured";
  showAvailable?: boolean;
  className?: string;
}

export function BusinessGrid({ 
  businesses, 
  variant = "default", 
  showAvailable = false,
  className 
}: BusinessGridProps) {
  const validBusinesses = businesses.filter(b => b && b.id && b.name);
  
  if (validBusinesses.length === 0) {
    return null;
  }

  const gridCols = variant === "compact"
    ? "grid-cols-1"
    : variant === "featured"
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols, className)}>
      {validBusinesses.map((business, index) => (
        <BusinessPreviewCard
          key={`${business.id}-${index}`}
          business={business}
          index={index}
          variant={variant}
          showAvailable={showAvailable}
        />
      ))}
    </div>
  );
}
