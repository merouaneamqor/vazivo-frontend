 "use client";

import { addDays, format, isToday, isTomorrow } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useBusinessAvailability } from "@/hooks/useBookings";
import type { Business, AvailabilityDay } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessAvailabilityTableProps {
  business: Business;
  className?: string;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE dd MMM");
}

function AvailabilityTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 py-1"
        >
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BusinessAvailabilityTable({
  business,
  className,
}: BusinessAvailabilityTableProps) {
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addDays(today, 6), "yyyy-MM-dd");

  const { data, isLoading, isError } = useBusinessAvailability(
    business.slug,
    startDate,
    endDate
  );

  if (isLoading) {
    return <AvailabilityTableSkeleton />;
  }

  if (isError || !data?.calendar?.length) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-neutral-500", className)}>
        <CalendarDays className="h-4 w-4 text-neutral-400" />
        <span>No upcoming online availability. Please call the venue to book.</span>
      </div>
    );
  }

  const days = data.calendar as AvailabilityDay[];

  return (
    <div className={cn("space-y-2", className)}>
      {days.map((day) => {
        const availableSlots =
          day.slots?.filter((slot) => slot.available) ?? [];

        return (
          <div
            key={day.date}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm",
              day.is_open && availableSlots.length
                ? "bg-neutral-50"
                : "bg-white"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium text-neutral-900">
                {formatDateLabel(day.date)}
              </span>
              <span className="text-xs text-neutral-500">
                {day.is_open ? day.day_name : "Closed"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 justify-end min-w-[120px]">
              {!day.is_open || !availableSlots.length ? (
                <span className="text-xs text-neutral-400">No slots</span>
              ) : (
                <>
                  {availableSlots.slice(0, 4).map((slot) => (
                    <span
                      key={slot.time}
                      className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
                    >
                      {slot.time}
                    </span>
                  ))}
                  {availableSlots.length > 4 && (
                    <span className="text-[11px] text-neutral-500">
                      +{availableSlots.length - 4} more
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

