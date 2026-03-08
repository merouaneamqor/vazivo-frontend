/**
 * Feature Flag Card
 * Displays a single flag's state in the architecture dashboard.
 */

"use client";

import { cn } from "@/lib/utils";
import type { FlagMeta } from "@/shared/flags/types";

interface FlagCardProps {
  meta: FlagMeta;
  currentValue: boolean | string;
}

const FEATURE_COLORS: Record<string, string> = {
  booking:     "bg-sky-900/40 border-sky-700/40 text-sky-300",
  search:      "bg-teal-900/40 border-teal-700/40 text-teal-300",
  business:    "bg-orange-900/40 border-orange-700/40 text-orange-300",
  analytics:   "bg-violet-900/40 border-violet-700/40 text-violet-300",
  onboarding:  "bg-pink-900/40 border-pink-700/40 text-pink-300",
};

const FEATURE_DOT: Record<string, string> = {
  booking:    "bg-sky-400",
  search:     "bg-teal-400",
  business:   "bg-orange-400",
  analytics:  "bg-violet-400",
  onboarding: "bg-pink-400",
};

export function FlagCard({ meta, currentValue }: FlagCardProps) {
  const isOn = Boolean(currentValue);
  const chipClass = FEATURE_COLORS[meta.feature] ?? "bg-slate-800 border-slate-700 text-slate-400";
  const dotClass  = FEATURE_DOT[meta.feature]   ?? "bg-slate-400";

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors",
      isOn && "border-slate-700"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <code className="text-xs text-slate-300 font-mono leading-tight break-all">
          {meta.key}
        </code>
        {/* On / Off pill */}
        <span className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
          isOn
            ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
            : "bg-slate-800 text-slate-500 border border-slate-700"
        )}>
          {isOn ? "ON" : "OFF"}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed">
        {meta.description}
      </p>

      {/* Feature chip */}
      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-mono border", chipClass)}>
          {meta.feature}
        </span>
        <span className="ml-auto text-[10px] text-slate-600 font-mono">
          default: {String(meta.defaultValue)}
        </span>
      </div>
    </div>
  );
}
