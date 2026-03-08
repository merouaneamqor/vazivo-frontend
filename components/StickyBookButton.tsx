"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyBookButtonProps {
  businessName: string;
  minPrice?: number;
  onBook: () => void;
  isVisible: boolean;
}

export default function StickyBookButton({
  businessName,
  minPrice,
  onBook,
  isVisible,
}: StickyBookButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-neutral-100 px-4 py-3 safe-area-inset-bottom"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-neutral-900 truncate">{businessName}</p>
              {minPrice && (
                <p className="text-sm text-neutral-500">
                  From ${minPrice}
                </p>
              )}
            </div>
            <Button onClick={onBook} className="flex-shrink-0">
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
