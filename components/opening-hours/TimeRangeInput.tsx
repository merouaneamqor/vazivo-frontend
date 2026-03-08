"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OpeningHoursInterval } from "@/types";

const STEP_MINUTES = 15;

export interface TimeRangeInputProps {
  value: OpeningHoursInterval;
  onChange: (value: OpeningHoursInterval) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  disabled?: boolean;
  error?: boolean;
  /** When adding next interval, suggest start = previous end. Not used for display. */
  previousEnd?: string | null;
  className?: string;
}

export function TimeRangeInput({
  value,
  onChange,
  onRemove,
  canRemove = true,
  disabled,
  error,
  className,
}: TimeRangeInputProps) {
  const openMinutes = timeToMinutes(value.open);
  const closeMinutes = timeToMinutes(value.close);
  const invalid = openMinutes >= closeMinutes;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Input
        type="time"
        step={STEP_MINUTES * 60}
        value={value.open}
        onChange={(e) => onChange({ ...value, open: e.target.value })}
        disabled={disabled}
        className={cn(
          "w-28 h-9 text-sm rounded-lg",
          (error || invalid) && "border-error-500 focus:ring-error-500"
        )}
        aria-label="Start time"
      />
      <span className="text-neutral-500 text-sm">–</span>
      <Input
        type="time"
        step={STEP_MINUTES * 60}
        value={value.close}
        onChange={(e) => onChange({ ...value, close: e.target.value })}
        disabled={disabled}
        className={cn(
          "w-28 h-9 text-sm rounded-lg",
          (error || invalid) && "border-error-500 focus:ring-error-500"
        )}
        aria-label="End time"
      />
      {canRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded-lg p-2 text-neutral-400 hover:text-error-600 hover:bg-error-50 transition-colors"
          aria-label="Remove interval"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      {invalid && (
        <span className="text-error-600 text-xs w-full">End must be after start</span>
      )}
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
