"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CUISINES = [
  "All",
  "Moroccan",
  "Italian",
  "Japanese",
  "French",
  "Mediterranean",
  "Seafood",
  "Street food",
  "International",
];

function CuisineFilters({ onFilter }: { onFilter?: (cuisine: string) => void }) {
  const [active, setActive] = useState("All");

  const handleClick = (cuisine: string) => {
    setActive(cuisine);
    onFilter?.(cuisine);
  };

  return (
    <section className="py-8 border-b border-neutral-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-vazivo-warmMuted mb-4">Filter by cuisine</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CUISINES.map((cuisine) => (
            <motion.button
              key={cuisine}
              onClick={() => handleClick(cuisine)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                active === cuisine
                  ? "bg-vazivo-red text-white shadow-vazivo"
                  : "bg-vazivo-creamDark text-vazivo-warmMuted hover:bg-vazivo-orangeSoft hover:text-vazivo-warmGray"
              )}
            >
              {cuisine}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
