"use client";

import { useState } from "react";
import Image from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import { cn } from "@/lib/utils";
import type { GalleryImage as GalleryImageType } from "./types";

interface GalleryImageProps {
  image: GalleryImageType;
  index: number;
  priority?: boolean;
  className?: string;
  aspectRatio?: "16/10" | "4/3" | "square" | "fill";
  sizes?: string;
}

const aspectClasses: Record<NonNullable<GalleryImageProps["aspectRatio"]>, string> = {
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  square: "aspect-square",
  fill: "h-full w-full min-h-0",
};

export function GalleryImage({
  image,
  index,
  priority = false,
  className,
  aspectRatio = "16/10",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 420px",
}: GalleryImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden  bg-neutral-100 transition-[transform,box-shadow] duration-200 ease-out group-hover:shadow-lg",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-neutral-200"
          aria-hidden
        />
      )}
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        loader={cloudinaryLoader}
        className={cn(
          "object-cover object-center transition-[transform,opacity] duration-200 ease-out group-hover:scale-[1.03]",
          loaded ? "opacity-100" : "opacity-0"
        )}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
      />
      <div
        className="absolute inset-0 bg-black/0 transition-colors duration-200 ease-out group-hover:bg-black/[0.06]"
        aria-hidden
      />
    </div>
  );
}
