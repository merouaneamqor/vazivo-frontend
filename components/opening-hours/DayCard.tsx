"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { OpeningHoursDay, OpeningHoursInterval } from "@/types";
import { TimeRangeInput } from "./TimeRangeInput";

const MAX_INTERVALS = 5;

export interface DayCardProps {
  dayKey: string;
  dayLabel: string;
  intervals: OpeningHoursDay;
  onChange: (intervals: OpeningHoursDay) => void;
  disabled?: boolean;
}

export function DayCard({ dayKey, dayLabel, intervals, onChange, disabled }: DayCardProps) {
  const isOpen = intervals.length > 0;

  const setOpen = (open: boolean) => {
    if (open && intervals.length === 0) {
      onChange([{ open: "09:00", close: "17:00" }]);
    } else if (!open) {
      onChange([]);
    }
  };

  const updateInterval = (index: number, value: OpeningHoursInterval) => {
    const next = [...intervals];
    next[index] = value;
    onChange(next);
  };

  const removeInterval = (index: number) => {
    const next = intervals.filter((_, i) => i !== index);
    onChange(next);
  };

  const addInterval = () => {
    if (intervals.length >= MAX_INTERVALS) return;
    const last = intervals[intervals.length - 1];
    const nextStart = last ? last.close : "09:00";
    onChange([...intervals, { open: nextStart, close: "17:00" }]);
  };

  return (
    <div
      className={cn(
        " border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md",
        "p-4 flex flex-col gap-3"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-neutral-800">{dayLabel}</span>
        <Switch
          checked={isOpen}
          onCheckedChange={setOpen}
          disabled={disabled}
          aria-label={`${dayLabel} open`}
        />
      </div>

      {isOpen && (
        <div className="space-y-2">
          {intervals.map((interval, index) => (
            <TimeRangeInput
              key={index}
              value={interval}
              onChange={(v) => updateInterval(index, v)}
              onRemove={intervals.length > 1 ? () => removeInterval(index) : undefined}
              canRemove={intervals.length > 1}
              disabled={disabled}
            />
          ))}
          {intervals.length < MAX_INTERVALS && (
            <button
              type="button"
              onClick={addInterval}
              disabled={disabled}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-lg border border-current">+</span>
              Add interval
            </button>
          )}
        </div>
      )}

      {!isOpen && (
        <p className="text-sm text-neutral-500">Closed</p>
      )}
    </div>
  );
}
