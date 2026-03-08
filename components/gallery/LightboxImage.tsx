"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import type { GalleryImage } from "./types";

interface LightboxImageProps {
  images: GalleryImage[];
  currentIndex: number;
}

export function LightboxImage({ images, currentIndex }: LightboxImageProps) {
  if (images.length === 0) return null;

  const current = images[currentIndex];
  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative h-full w-full max-w-6xl max-h-[85vh] mx-auto"
        >
          <Image
            src={current.url}
            alt={current.alt}
            fill
            sizes="100vw"
            loader={cloudinaryLoader}
            className="object-contain"
            priority
          />
        </motion.div>
      </AnimatePresence>
      {/* Preload adjacent images */}
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 opacity-0 pointer-events-none overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src={images[prevIndex].url}
                alt=""
                fill
                sizes="100vw"
                loader={cloudinaryLoader}
              />
            </div>
          </div>
          <div className="absolute inset-0 opacity-0 pointer-events-none overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src={images[nextIndex].url}
                alt=""
                fill
                sizes="100vw"
                loader={cloudinaryLoader}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
