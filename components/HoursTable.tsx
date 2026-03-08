"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpeningHours, OpeningHoursPayload } from "@/types";

/** Normalize API value (legacy or array) to array of intervals for display. */
function getIntervals(dayHours: unknown): Array<{ open: string; close: string }> {
  if (!dayHours) return [];
  if (Array.isArray(dayHours)) {
    return dayHours.filter((h) => h && h.open && h.close).map((h) => ({ open: String(h.open), close: String(h.close) }));
  }
  const open = (dayHours as { open?: string }).open;
  const close = (dayHours as { close?: string }).close;
  return open && close ? [{ open: String(open), close: String(close) }] : [];
}

interface HoursTableProps {
  hours: OpeningHours | OpeningHoursPayload;
  className?: string;
}

const DAYS: { key: string; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function HoursTable({ hours, className }: HoursTableProps) {
  const today = format(new Date(), "EEEE").toLowerCase();

  return (
    <ul className={cn("space-y-0 list-none p-0 m-0", className)} role="list">
      {DAYS.map(({ key, label }) => {
        const intervals = getIntervals(hours?.[key]);
        const isToday = today === key;
        const isOpen = intervals.length > 0;
        const display = isOpen ? intervals.map((i) => `${i.open} – ${i.close}`).join(", ") : "Closed";

        return (
          <li
            key={key}
            className={cn(
              "flex items-center justify-between gap-3 py-3 px-0 text-[15px] transition-colors rounded-lg",
              isToday && "bg-neutral-50/80 -mx-1 px-3"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {!isOpen && (
                <span
                  className="flex h-2 w-2 shrink-0 rounded-full bg-red-400"
                  aria-hidden
                />
              )}
              {isOpen && isToday && (
                <span className="flex shrink-0" aria-hidden>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                  </span>
                </span>
              )}
              {isOpen && !isToday && <span className="w-2 shrink-0" aria-hidden />}
              <span
                className={cn(
                  "capitalize",
                  isToday ? "font-semibold text-foreground" : "text-neutral-600"
                )}
              >
                {label}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 text-[15px]",
                isToday ? "font-medium text-foreground" : "text-neutral-500",
                !isOpen && "text-neutral-400"
              )}
            >
              {display}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Compact hours display (accepts full week or single day { open, close })
type CompactHoursInput = OpeningHours | OpeningHoursPayload | { open: string; close: string };
interface CompactHoursProps {
  hours: CompactHoursInput;
  isOpen?: boolean;
  className?: string;
}

function isSingleDayHours(h: CompactHoursInput): h is { open: string; close: string } {
  return typeof h === "object" && h !== null && "open" in h && !("monday" in h);
}

export function CompactHours({ hours, isOpen, className }: CompactHoursProps) {
  const today = format(new Date(), "EEEE").toLowerCase();
  const todayRaw = isSingleDayHours(hours) ? hours : (hours as OpeningHoursPayload)?.[today];
  const todayIntervals = getIntervals(todayRaw);
  const first = todayIntervals[0];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isOpen !== undefined && (
        <span
          className={cn(
            "flex items-center gap-1.5 text-[15px] font-medium",
            isOpen ? "text-success-600" : "text-neutral-500"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              isOpen ? "bg-success-500" : "bg-neutral-400"
            )}
          />
          {isOpen ? "Open" : "Closed"}
        </span>
      )}
      {first && (
        <span className="text-[15px] text-neutral-500">
          Today: {todayIntervals.map((i) => `${i.open} – ${i.close}`).join(", ")}
        </span>
      )}
    </div>
  );
}
