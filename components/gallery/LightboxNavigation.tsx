"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasMultiple: boolean;
}

export function LightboxNavigation({
  onPrevious,
  onNext,
  hasMultiple,
}: LightboxNavigationProps) {
  if (!hasMultiple) return null;

  const buttonClass =
    "absolute top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 sm:min-h-[48px] sm:min-w-[48px]";

  return (
    <>
      <motion.button
        type="button"
        onClick={onPrevious}
        className={`left-2 sm:left-4 ${buttonClass}`}
        aria-label="Previous photo"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
      </motion.button>
      <motion.button
        type="button"
        onClick={onNext}
        className={`right-2 sm:right-4 ${buttonClass}`}
        aria-label="Next photo"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
      </motion.button>
    </>
  );
}
