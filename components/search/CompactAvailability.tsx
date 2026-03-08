"use client";

import Link from "next/link";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useBusinessAvailability } from "@/hooks/useBookings";
import { getBusinessPath, cn } from "@/lib/utils";
import type { Business } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CompactAvailabilityProps {
    business: Business;
    maxSlots?: number;
    onSlotSelect?: (business: Business, date: string, time: string) => void;
}

/** Classify a time string "HH:MM" into morning / afternoon / evening */
function getTimeOfDay(time: string): "morning" | "afternoon" | "evening" {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
}

const pillTone: Record<string, string> = {
    morning: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
    afternoon: "bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100",
    evening: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
};

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE");
}

export function CompactAvailabilitySkeleton() {
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2].map((i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-lg" />
            ))}
        </div>
    );
}

export default function CompactAvailability({
    business,
    maxSlots = 3,
    onSlotSelect,
}: CompactAvailabilityProps) {
    const today = new Date();
    const startDate = format(today, "yyyy-MM-dd");
    const endDate = format(addDays(today, 6), "yyyy-MM-dd");

    const { data, isLoading, isError } = useBusinessAvailability(
        business.slug,
        startDate,
        endDate
    );

    if (isLoading) {
        return <CompactAvailabilitySkeleton />;
    }

    if (isError || !data?.calendar) {
        return (
            <Link
                href={`${getBusinessPath(business)}#opening-hours`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
                <CalendarDays className="h-3.5 w-3.5" />
                Check availability
            </Link>
        );
    }

    // Collect next N available slots across days
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const slots: { date: string; time: string; label: string }[] = [];

    for (const day of data.calendar) {
        if (slots.length >= maxSlots) break;
        const available = day.slots?.filter((s) => s.available) ?? [];
        for (const slot of available) {
            if (slots.length >= maxSlots) break;
            // Skip past slots for today
            if (day.date === todayStr) {
                const [h, m] = slot.time.split(":").map(Number);
                const slotTime = new Date(now);
                slotTime.setHours(h, m, 0, 0);
                if (slotTime <= now) continue;
            }
            slots.push({
                date: day.date,
                time: slot.time,
                label: formatDateLabel(day.date),
            });
        }
    }

    if (slots.length === 0) {
        return (
            <Link
                href={`${getBusinessPath(business)}#opening-hours`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
                <CalendarDays className="h-3.5 w-3.5" />
                See availability
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {slots.slice(0, 2).map((slot, i) => {
                const tone = getTimeOfDay(slot.time);
                const Wrapper = onSlotSelect ? "button" : Link;
                const wrapperProps = onSlotSelect
                    ? {
                        type: "button" as const,
                        onClick: (e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSlotSelect(business, slot.date, slot.time);
                        },
                    }
                    : {
                        href: `${getBusinessPath(business)}?date=${slot.date}&time=${slot.time}`,
                        onClick: (e: React.MouseEvent) => e.stopPropagation(),
                    };

                return (
                    <Wrapper
                        key={`${slot.date}-${slot.time}-${i}`}
                        {...(wrapperProps as any)}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors whitespace-nowrap",
                            pillTone[tone]
                        )}
                    >
                        <span className="text-[9px] font-medium opacity-75">{slot.label}</span>
                        <span>{slot.time}</span>
                    </Wrapper>
                );
                })}
            <Link
                href={`${getBusinessPath(business)}#opening-hours`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-[10px] font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
            >
                +{slots.length - 2}
            </Link>
        </div>
    );
}
