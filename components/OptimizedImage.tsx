"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { generateOptimizedCloudinaryUrl, getResponsiveSizes } from "@/lib/image-optimization";

interface OptimizedImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  context?: "hero" | "card" | "thumbnail" | "profile";
  className?: string;
  containerClassName?: string;
  fallbackColor?: string;
  aspectRatio?: "square" | "video" | "golden" | "auto";
}

/**
 * Optimized Image component with Cloudinary integration
 * Automatically optimizes for responsive sizing and performance
 */
export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  quality = 80,
  context = "card",
  className,
  containerClassName,
  fallbackColor = "#f3f4f6",
  aspectRatio = "auto",
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Default aspect ratio values
  const aspectRatioMap = {
    square: "aspect-square",
    video: "aspect-video",
    golden: "aspect-[4/5]",
    auto: "",
  };

  useEffect(() => {
    if (!src) {
      setError(true);
      setIsLoading(false);
      return;
    }

    // Optimize Cloudinary URLs
    if (src.includes("cloudinary") || src.includes("res.cloudinary")) {
      const optimized = generateOptimizedCloudinaryUrl(src, {
        width,
        height,
        quality: quality >= 80 ? "high" : quality >= 50 ? "medium" : "low",
        format: "auto",
        crop: "fill",
        gravity: "auto",
      });
      setImageSrc(optimized);
    } else {
      setImageSrc(src);
    }
  }, [src, width, height, quality]);

  const sizes = getResponsiveSizes(context);

  if (error || !imageSrc) {
    return (
      <div
        className={cn(
          "bg-neutral-100 flex items-center justify-center",
          aspectRatioMap[aspectRatio],
          containerClassName
        )}
        style={{ backgroundColor: fallbackColor }}
      >
        <span className="text-neutral-400 text-sm">{alt}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatioMap[aspectRatio],
        containerClassName
      )}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={cn("object-cover object-center w-full h-full", className)}
        onError={() => setError(true)}
        onLoad={() => setIsLoading(false)}
        placeholder="empty"
        loading={priority ? "eager" : "lazy"}
      />
      {isLoading && !priority && (
        <div
          className="absolute inset-0 bg-neutral-100 animate-pulse"
          aria-hidden
        />
      )}
    </div>
  );
}

export default OptimizedImage;
