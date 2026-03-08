"use client";

import { Grid3X3 } from "lucide-react";

interface ViewAllButtonProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export function ViewAllButton({ count, onClick }: ViewAllButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-xl bg-black/60 p-3 shadow-lg backdrop-blur-sm transition hover:bg-black/70 active:scale-[0.98] sm:bottom-5 sm:right-5"
      aria-label={`View all ${count} photos`}
    >
      <div className="flex flex-col items-center gap-1">
        <Grid3X3 className="h-5 w-5 text-white" aria-hidden />
        <span className="text-xs font-semibold text-white whitespace-nowrap">+{count - 1}</span>
      </div>
    </button>
  );
}
