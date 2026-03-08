"use client";

import type { GalleryRootProps, GalleryImage } from "./types";
import { GalleryProvider } from "./GalleryContext";
import { HeroGallery } from "./HeroGallery";
import { LightboxModal } from "./LightboxModal";
import { OverlayControls } from "./OverlayControls";

const PLACEHOLDER_IMAGE: GalleryImage = {
  url: "/masscotte.png",
  alt: "No photos yet",
};

export function GalleryRoot({
  images: rawImages,
  initialIndex = 0,
  businessName,
  maxSideThumbnails = 3,
  enableShare = false,
  enableFavorite = false,
  onShare,
  onFavorite,
  onBack,
  renderFavorite,
}: GalleryRootProps) {
  const images =
    rawImages.length > 0
      ? rawImages
      : [PLACEHOLDER_IMAGE];

  return (
    <GalleryProvider images={images} initialIndex={initialIndex}>
      <figure className="relative m-0 overflow-hidden  bg-white">
        <HeroGallery maxSideThumbnails={maxSideThumbnails} />
        <OverlayControls
          enableShare={enableShare}
          enableFavorite={enableFavorite}
          onShare={onShare}
          onBack={onBack}
          renderFavorite={renderFavorite}
          className="absolute top-3 right-4 z-10 flex items-center gap-1.5"
          backClassName="absolute top-3 left-4 z-10"
        />
      </figure>
      <LightboxModal />
    </GalleryProvider>
  );
}
