"use client";

import { useState } from "react";
import Image from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import { ZoomIn, Grid } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/ImageLightbox";

interface PhotoGalleryProps {
  images: string[];
  businessName: string;
  className?: string;
}

export default function PhotoGallery({ images, businessName, className }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use default placeholder if no images available
  const defaultPlaceholderImage = "/masscotte.png";
  const displayImages = images.length > 0 ? images : [defaultPlaceholderImage];

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  if (displayImages.length === 1) {
    return (
      <div 
        className={cn("relative h-64 md:h-80 cursor-pointer group", className)}
        onClick={() => openLightbox(0)}
      >
        <Image
          src={displayImages[0]}
          alt={businessName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          loader={cloudinaryLoader}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ZoomIn className="h-8 w-8 text-white" />
        </div>
        <ImageLightbox
          isOpen={lightboxOpen}
          images={displayImages}
          currentIndex={currentIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSelectIndex={(i) => setCurrentIndex(i)}
        />
      </div>
    );
  }

  // Grid layout for multiple images
  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64 md:h-96">
        {/* Main large image */}
        <div 
          className="col-span-2 row-span-2 relative cursor-pointer group rounded-l-2xl overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={displayImages[0]}
            alt={`${businessName} - Main`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            loader={cloudinaryLoader}
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>

        {/* Smaller images */}
        {displayImages.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative cursor-pointer group overflow-hidden",
              index === 1 && "rounded-tr-2xl",
              index === 3 && "rounded-br-2xl"
            )}
            onClick={() => openLightbox(index + 1)}
          >
            <Image
              src={image}
              alt={`${businessName} - ${index + 2}`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              loader={cloudinaryLoader}
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            
            {/* Show more overlay on last visible image */}
            {index === 3 && displayImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{displayImages.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View all button */}
      {displayImages.length > 1 && (
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white transition-colors shadow-soft"
        >
          <Grid className="h-4 w-4" />
          View all {displayImages.length} photos
        </button>
      )}

      <ImageLightbox
        isOpen={lightboxOpen}
        images={displayImages}
        currentIndex={currentIndex}
        onClose={closeLightbox}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSelectIndex={(i) => setCurrentIndex(i)}
      />
    </div>
  );
}
