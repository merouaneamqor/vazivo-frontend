"use client";

import { useMemo, useState } from "react";
import { addDays, addWeeks, eachDayOfInterval, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useBusinessAvailability } from "@/hooks/useBookings";
import type { Business, AvailabilityDay, TimeSlot } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ─────────────────────────── types ─────────────────────────── */

interface AvailabilityCarouselProps {
  business: Business;
  onSlotSelect?: (args: { business: Business; date: string; time: string }) => void;
}

interface WeekHeaderNavProps {
  startDate: Date;
  endDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

interface TimeSlotPillProps {
  time: string;
  onClick?: () => void;
}

interface MoreSlotsButtonProps {
  remaining: number;
  onClick?: () => void;
}

interface ClosedDayBadgeProps {
  label?: string;
}

interface NoSlotsBadgeProps {
  label?: string;
}

/* ─────────────────────────── helpers ─────────────────────────── */

function formatWeekRange(startDate: Date, endDate: Date): string {
  const startLabel = format(startDate, "EEE d MMM");
  const endLabel = format(endDate, "EEE d MMM");
  return `${startLabel} – ${endLabel}`;
}

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

const MAX_VISIBLE_ROWS = 6;

/* ─────────────────────────── main carousel ─────────────────────────── */

export function AvailabilityCarousel({
  business,
  onSlotSelect,
}: AvailabilityCarouselProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAllRows, setShowAllRows] = useState(false);

  const weekStart = useMemo(() => {
    const base = getWeekStart(new Date());
    return addWeeks(base, weekOffset);
  }, [weekOffset]);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const startDateStr = format(weekStart, "yyyy-MM-dd");
  const endDateStr = format(weekEnd, "yyyy-MM-dd");

  const { data, isLoading, isError } = useBusinessAvailability(
    business.slug,
    startDateStr,
    endDateStr
  );

  const days: AvailabilityDay[] = useMemo(() => {
    const byDate = new Map<string, AvailabilityDay>();
    if (data?.calendar) {
      for (const d of data.calendar as AvailabilityDay[]) {
        byDate.set(d.date, d);
      }
    }

    return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const existing = byDate.get(dateStr);
      if (existing) return existing;
      return {
        date: dateStr,
        day_name: format(date, "EEE"),
        is_open: false,
        slots: [],
      };
    });
  }, [data?.calendar, weekStart, weekEnd]);

  const { timeRows, slotsByDayDate } = useMemo(() => {
    const byDayDate: Record<string, Record<string, TimeSlot>> = {};
    const times = new Set<string>();

    for (const day of days) {
      const dateKey = day.date;
      if (!byDayDate[dateKey]) {
        byDayDate[dateKey] = {};
      }
      const availableSlots = (day.slots || []).filter((slot) => slot.available);
      for (const slot of availableSlots) {
        byDayDate[dateKey][slot.time] = slot;
        times.add(slot.time);
      }
    }

    const timeRows = Array.from(times).sort();

    return { timeRows, slotsByDayDate: byDayDate };
  }, [days]);

  const visibleTimeRows = showAllRows ? timeRows : timeRows.slice(0, MAX_VISIBLE_ROWS);

  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);

  /* ── loading / error / empty states ── */

  if (isLoading) {
    return (
      <div className="space-y-2">
        <WeekHeaderNavSkeleton />
        <GridSkeleton />
      </div>
    );
  }

  if (isError || !data?.calendar) {
    return (
      <div className="flex items-start gap-3  border border-[#EAE6F5] bg-[#F8F5FF] px-4 py-3">
        <div className="mt-0.5 rounded-full bg-white p-1.5 shadow-sm">
          <CalendarDays className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-neutral-900">
            Availability not available
          </p>
          <p className="text-xs text-neutral-500">
            We couldn&apos;t load online slots. Please try again later or call the venue to book.
          </p>
        </div>
      </div>
    );
  }

  const handleSlotClick = (date: string, time: string) => {
    if (onSlotSelect) {
      onSlotSelect({ business, date, time });
    }
  };

  return (
    <section aria-label="Next available appointments" className="space-y-2">
      <WeekHeaderNav
        startDate={weekStart}
        endDate={weekEnd}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />

      {timeRows.length === 0 ? (
        <div className="mt-2 flex justify-center">
          <NoSlotsBadge label="No slots this week" />
        </div>
      ) : (
        <div className="mt-2  border border-[#EAE6F5] bg-[#FAF8FF] px-2 py-1">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 text-center">
              <thead>
                <tr>
                  {days.map((day) => {
                    const dateObj = new Date(day.date + "T00:00:00");
                    const isToday =
                      format(dateObj, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

                    return (
                      <th key={day.date} className="px-0.5 align-bottom">
                        <div className="flex flex-col items-center gap-0">
                          <span
                            className={cn(
                              "text-[11px] font-semibold",
                              isToday ? "text-[#7C3AED]" : "text-neutral-800"
                            )}
                          >
                            {format(dateObj, "EEE")}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {format(dateObj, "d MMM")}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleTimeRows.map((time) => (
                  <tr key={time}>
                    {days.map((day) => {
                      const slotForCell = slotsByDayDate[day.date]?.[time];

                      return (
                        <td key={`${day.date}-${time}`} className="px-0.25 py-0">
                          {slotForCell ? (
                            <TimeSlotPill
                              time={time}
                              onClick={() => handleSlotClick(day.date, time)}
                            />
                          ) : (
                            <span className="text-[11px] text-neutral-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {timeRows.length > MAX_VISIBLE_ROWS && !showAllRows && (
              <div className="mt-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllRows(true)}
                  className="text-[11px] font-medium text-[#7C3AED] underline-offset-2 hover:underline"
                >
                  Show more slots
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────── WeekHeaderNav ─────────────────────────── */

export function WeekHeaderNav({
  startDate,
  endDate,
  onPrevWeek,
  onNextWeek,
}: WeekHeaderNavProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrevWeek}
        aria-label="Previous week"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAE6F5] bg-white text-neutral-500 hover:border-[#D0C4FF] hover:text-neutral-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <p className="flex-1 text-center text-sm font-medium text-neutral-900">
        {formatWeekRange(startDate, endDate)}
      </p>

      <button
        type="button"
        onClick={onNextWeek}
        aria-label="Next week"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAE6F5] bg-white text-neutral-500 hover:border-[#D0C4FF] hover:text-neutral-800 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function WeekHeaderNavSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-40 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-2  border border-[#EAE6F5] bg-[#FAF8FF] px-2 py-1">
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-0">
              <Skeleton className="h-3 w-10 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <div key={colIdx} className="flex justify-center">
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Time slot pill ─────────────────────────── */

export function TimeSlotPill({ time, onClick }: TimeSlotPillProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {time}
    </button>
  );
}

/* ─────────────────────────── Closed / empty badges ─────────────────────────── */

export function ClosedDayBadge({ label = "Closed" }: ClosedDayBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      {label}
    </div>
  );
}

export function NoSlotsBadge({ label = "No slots" }: NoSlotsBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
      {label}
    </div>
  );
}

