"use client";

import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthLevel = "good" | "warn" | "bad";

function getHealthLevel(
  score: number,
  noShowRate?: number,
  cancellationRate?: number
): HealthLevel {
  const noShow = noShowRate ?? 0;
  if (score >= 5 && noShow < 0.1) return "good";
  if (score >= 3 || noShow < 0.2) return "warn";
  return "bad";
}

const levelConfig: Record<HealthLevel, { className: string; label: string }> = {
  good: { className: "text-emerald-600 bg-emerald-50", label: "Good" },
  warn: { className: "text-amber-600 bg-amber-50", label: "Fair" },
  bad: { className: "text-red-600 bg-red-50", label: "Poor" },
};

export function HealthScoreIndicator({
  score,
  noShowRate,
  cancellationRate,
  className,
  showLabel,
}: {
  score: number;
  noShowRate?: number;
  cancellationRate?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const level = getHealthLevel(score, noShowRate, cancellationRate);
  const config = levelConfig[level];
  const tooltip = `Onboarding: ${score}/7. No-show: ${((noShowRate ?? 0) * 100).toFixed(1)}%. Cancel: ${((cancellationRate ?? 0) * 100).toFixed(1)}%.`;

  return (
    <span
      title={tooltip}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Activity className="h-3.5 w-3.5 shrink-0" />
      {showLabel ? config.label : `${score}/7`}
    </span>
  );
}
