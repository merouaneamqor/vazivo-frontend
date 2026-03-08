"use client";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
import type { Business } from "@/types";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  business: Business;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button" | "overlay";
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({
  business,
  size = "md",
  variant = "icon",
  className,
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isSaved = isFavorite(business.id);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasAdded = toggleFavorite(business);
    
    if (wasAdded) {
      toast.success(`Added ${business.name} to favorites`);
    } else {
      toast(`Removed from favorites`, {
        icon: "💔",
      });
    }
  };

  if (variant === "overlay") {
    return (
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "absolute p-2 rounded-full bg-white/90 backdrop-blur-sm",
          "hover:bg-white transition-colors shadow-soft",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          className
        )}
        aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isSaved ? "filled" : "empty"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Heart
              className={cn(
                sizeClasses[size],
                "transition-colors",
                isSaved
                  ? "text-red-500 fill-red-500"
                  : "text-neutral-600 hover:text-red-500"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === "button") {
    return (
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 ",
          "font-medium text-sm transition-all",
          isSaved
            ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
            : "bg-white text-neutral-700 border border-neutral-200 hover:border-primary-300 hover:text-primary-600",
          className
        )}
        aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            sizeClasses[size],
            isSaved && "fill-red-500"
          )}
        />
        {showLabel && (
          <span>{isSaved ? "Saved" : "Save"}</span>
        )}
      </motion.button>
    );
  }

  // Default icon variant
  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "p-2 rounded-full transition-colors",
        "hover:bg-neutral-100",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        className
      )}
      aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          "transition-colors",
          isSaved
            ? "text-red-500 fill-red-500"
            : "text-neutral-400 hover:text-red-500"
        )}
      />
    </motion.button>
  );
}
