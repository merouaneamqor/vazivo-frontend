"use client";

import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Star, StarHalf } from "lucide-react";
import { motion } from "framer-motion";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  showCount = false,
  count = 0,
  className,
}: RatingStarsProps) {
  const numericRating = Number(rating) || 0;
  
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizeClasses[size], "text-amber-400 fill-amber-400")}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn(sizeClasses[size], "text-neutral-200")} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={cn(sizeClasses[size], "text-amber-400 fill-amber-400")} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizeClasses[size], "text-neutral-200")}
          />
        ))}
      </div>
      
      {showValue && (
        <span className={cn("font-medium text-neutral-700", textSizes[size])}>
          {numericRating.toFixed(1)}
        </span>
      )}
      
      {showCount && count > 0 && (
        <span className={cn("text-neutral-500", textSizes[size])}>
          ({count})
        </span>
      )}
    </div>
  );
}

interface InteractiveRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export function InteractiveRating({
  value,
  onChange,
  size = "md",
  className,
  disabled = false,
}: InteractiveRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          className={cn(
            "focus:outline-none transition-colors",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              star <= displayValue
                ? "text-amber-400 fill-amber-400"
                : "text-neutral-300 hover:text-amber-200"
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}

// Compact rating display for cards
interface CompactRatingProps {
  rating: number;
  count?: number;
  className?: string;
}

export function CompactRating({ rating, count, className }: CompactRatingProps) {
  const numericRating = Number(rating) || 0;
  
  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
      <span className="font-medium text-neutral-700">
        {numericRating > 0 ? numericRating.toFixed(1) : "New"}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-neutral-500">({count})</span>
      )}
    </div>
  );
}
