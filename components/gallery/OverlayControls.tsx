"use client";

import { ChevronLeft, Share2 } from "lucide-react";

interface OverlayControlsProps {
  enableShare?: boolean;
  enableFavorite?: boolean;
  onShare?: () => void;
  onBack?: () => void;
  renderFavorite?: () => React.ReactNode;
  className?: string;
  backClassName?: string;
}

const overlayButtonClass =
  "flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-lg transition hover:bg-white hover:text-neutral-900 hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2";

export function OverlayControls({
  enableShare,
  enableFavorite,
  onShare,
  onBack,
  renderFavorite,
  className = "flex items-center justify-end gap-1.5",
  backClassName,
}: OverlayControlsProps) {
  return (
    <>
      {onBack && backClassName && (
        <div className={backClassName}>
          <button
            type="button"
            onClick={onBack}
            className={overlayButtonClass}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}
      <div className={className}>
        {enableFavorite && renderFavorite?.()}
        {enableShare && onShare && (
          <button
            type="button"
            onClick={onShare}
            className={overlayButtonClass}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}
