"use client";

import { useGallery } from "./GalleryContext";
import { GalleryImage } from "./GalleryImage";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Grid3X3 } from "lucide-react";

const THUMB_SIZES = "(min-width: 768px) 33vw, 280px";
const THUMB_BTN_CN =
  "relative h-full min-h-0 overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-inset focus:ring-offset-2 group";

export interface GalleryLayout {
  showSide: boolean;
  thumbIndices: number[];
  gridCols: number;
  gridRows: number;
}

/**
 * Derives side grid layout from image count.
 * - 1 image → hero only (no side).
 * - 2 → hero + 1 thumb + View all (1 row, 2 cols).
 * - 3 → hero + 2 thumbs + View all (2 rows, 2 cols).
 * - 4+ → hero + 3 thumbs + View all (2 rows, 2 cols).
 */
export function getGalleryLayout(
  imageCount: number,
  maxSideThumbnails: number = 3
): GalleryLayout {
  const showSide = imageCount >= 2;
  const maxThumbs = Math.min(maxSideThumbnails, Math.max(0, imageCount - 1));
  const thumbIndices = [1, 2, 3]
    .filter((i) => i < imageCount)
    .slice(0, maxThumbs);
  const gridCols = 2;
  const gridRows = thumbIndices.length === 1 ? 1 : 2;
  return { showSide, thumbIndices, gridCols, gridRows };
}

interface HeroGalleryProps {
  maxSideThumbnails?: number;
}

export function HeroGallery({ maxSideThumbnails = 3 }: HeroGalleryProps) {
  const { images, currentIndex, openAt, handleNext, handlePrev } = useGallery();

  if (images.length === 0) return null;

  const layout = getGalleryLayout(images.length, maxSideThumbnails);

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const { offset, velocity } = info;
    if (offset.x > 50 || velocity.x > 200) handlePrev();
    else if (offset.x < -50 || velocity.x < -200) handleNext();
  };

  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-2.5",
        layout.showSide
          ? "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
          : "grid-cols-1"
      )}
    >
      {/* Left: hero — tall and prominent */}
      <motion.div
        className="relative min-h-[240px] sm:min-h-[340px] lg:min-h-[420px] min-w-0 group"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <button
          type="button"
          onClick={() => openAt(currentIndex)}
          className="absolute inset-0 w-full rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-inset focus:ring-offset-2"
          aria-label={`View photo ${currentIndex + 1} of ${images.length}`}
        >
          <GalleryImage
            image={images[currentIndex]}
            index={currentIndex}
            priority
            aspectRatio="16/10"
            className="min-h-[240px] sm:min-h-[340px] lg:min-h-[420px] rounded-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 560px"
          />
        </button>
        {images.length > 1 && (
          <div
            className="absolute inset-x-0 bottom-0 z-[1] h-24 pointer-events-none rounded-b-xl bg-gradient-to-t from-black/40 via-black/10 to-transparent"
            aria-hidden
          />
        )}
      </motion.div>

      {/* Right: flexible grid — N thumbnails + "View all" cell */}
      {layout.showSide && (
        <div
          className="hidden md:grid gap-2 sm:gap-2.5 min-h-0 min-w-0"
          style={{
            gridTemplateColumns: `repeat(${layout.gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.gridRows}, minmax(0, 1fr))`,
          }}
        >
          {layout.thumbIndices.map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openAt(idx)}
              className={cn(
                THUMB_BTN_CN,
                currentIndex === idx && "ring-2 ring-neutral-800 ring-offset-2"
              )}
              aria-label={`Photo ${idx + 1} of ${images.length}`}
              aria-current={currentIndex === idx ? "true" : undefined}
            >
              <GalleryImage
                image={images[idx]}
                index={idx}
                aspectRatio="fill"
                sizes={THUMB_SIZES}
                className="h-full min-h-0 rounded-xl"
              />
            </button>
          ))}
          {/* "View all" cell — slight black transparent */}
          <button
            type="button"
            onClick={() => openAt(0)}
            className={cn(
              THUMB_BTN_CN,
              "bg-black/40 hover:bg-black/55 transition-colors flex flex-col items-center justify-center text-white"
            )}
            aria-label={`View all ${images.length} photos`}
          >
            <Grid3X3 className="h-8 w-8 mb-2 opacity-90" aria-hidden />
            <span className="text-sm font-medium">
              {images.length > layout.thumbIndices.length + 1
                ? `+${images.length - layout.thumbIndices.length - 1} `
                : ""}
              View all photos
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
