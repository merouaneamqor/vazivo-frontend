"use client";

import { useState } from "react";
import { Clock, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DAYS,
  getDefaultOpeningHoursMulti,
  toOpeningHoursMulti,
} from "@/lib/opening-hours";
import type { OpeningHoursMulti, OpeningHoursPayload } from "@/types";
import { DayCard } from "./DayCard";
import { cn } from "@/lib/utils";

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const WEEKEND = ["saturday", "sunday"];

interface OpeningHoursEditorProps {
  value: OpeningHoursMulti | OpeningHoursPayload | null | undefined;
  onChange: (value: OpeningHoursMulti) => void;
  disabled?: boolean;
  error?: string;
}

export function OpeningHoursEditor({
  value,
  onChange,
  disabled = false,
  error,
}: OpeningHoursEditorProps) {
  const multi = toOpeningHoursMulti(value ?? getDefaultOpeningHoursMulti());
  const [copySourceDay, setCopySourceDay] = useState<string>("monday");
  const [copyOpen, setCopyOpen] = useState(false);

  const updateDay = (day: string, intervals: OpeningHoursMulti[string]) => {
    onChange({ ...multi, [day]: intervals });
  };

  const applyPreset = (preset: OpeningHoursMulti) => {
    onChange(preset);
  };

  const presets: { label: string; getValue: () => OpeningHoursMulti }[] = [
    {
      label: "Weekdays 9–5",
      getValue: () => {
        const p: OpeningHoursMulti = {};
        DAYS.forEach((d) => {
          p[d] = WEEKDAYS.includes(d) ? [{ open: "09:00", close: "17:00" }] : [];
        });
        return p;
      },
    },
    {
      label: "Every day 9–6",
      getValue: () => {
        const p: OpeningHoursMulti = {};
        DAYS.forEach((d) => {
          p[d] = [{ open: "09:00", close: "18:00" }];
        });
        return p;
      },
    },
    {
      label: "24/7",
      getValue: () => {
        const p: OpeningHoursMulti = {};
        DAYS.forEach((d) => {
          p[d] = [{ open: "00:00", close: "23:59" }];
        });
        return p;
      },
    },
    {
      label: "Closed all week",
      getValue: () => {
        const p: OpeningHoursMulti = {};
        DAYS.forEach((d) => {
          p[d] = [];
        });
        return p;
      },
    },
  ];

  const copyToTargets = (targets: readonly string[]) => {
    const sourceIntervals = multi[copySourceDay] ?? [];
    const next = { ...multi };
    targets.forEach((day) => {
      next[day] = sourceIntervals.map((i) => ({ ...i }));
    });
    onChange(next);
    setCopyOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Clock className="h-4 w-4 text-primary-500" />
          Opening hours
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg text-xs border-neutral-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700"
              onClick={() => applyPreset(preset.getValue())}
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setCopyOpen(!copyOpen)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy <span className="hidden sm:inline">{copySourceDay}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", copyOpen && "rotate-180")} />
          </button>
          {copyOpen && (
            <>
              <div className="fixed inset-0 z-10" aria-hidden onClick={() => setCopyOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-56  border border-neutral-200 bg-white py-2 shadow-lg">
                <div className="px-3 py-1.5 text-xs font-medium text-neutral-500">Copy which day?</div>
                <select
                  value={copySourceDay}
                  onChange={(e) => setCopySourceDay(e.target.value)}
                  className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {DAY_LABELS[d]}
                    </option>
                  ))}
                </select>
                <div className="border-t border-neutral-100 pt-2">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => copyToTargets(DAYS)}
                  >
                    To all days
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => copyToTargets(WEEKDAYS)}
                  >
                    To weekdays
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                    onClick={() => copyToTargets(WEEKEND)}
                  >
                    To weekend
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((day) => (
          <DayCard
            key={day}
            dayKey={day}
            dayLabel={DAY_LABELS[day]}
            intervals={multi[day] ?? []}
            onChange={(intervals) => updateDay(day, intervals)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
