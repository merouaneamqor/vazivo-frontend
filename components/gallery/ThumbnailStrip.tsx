"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "./types";

interface ThumbnailStripProps {
  images: GalleryImage[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export function ThumbnailStrip({
  images,
  currentIndex,
  onSelectIndex,
}: ThumbnailStripProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentIndex]);

  if (images.length <= 1) return null;

  return (
    <div className="absolute bottom-3 left-1/2 z-10 hidden w-full max-w-full -translate-x-1/2 px-3 sm:block sm:bottom-4 sm:px-4">
      <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide sm:gap-1.5 sm:pb-2">
        {images.map((image, index) => {
          const isSelected = currentIndex === index;
          return (
            <motion.button
              key={index}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onSelectIndex(index)}
              className={cn(
                "relative h-12 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white sm:h-14 sm:w-20 sm:rounded-xl",
                isSelected
                  ? "scale-105 border-2 border-white shadow-md opacity-100"
                  : "border-white/30 opacity-60 hover:opacity-100"
              )}
              aria-label={`Photo ${index + 1} of ${images.length}`}
              aria-current={isSelected ? "true" : undefined}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                loader={cloudinaryLoader}
                className="object-cover object-center"
                loading="lazy"
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
