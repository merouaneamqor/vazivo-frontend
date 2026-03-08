export interface GalleryImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

import type { ReactNode } from "react";

export interface GalleryRootProps {
  images: GalleryImage[];
  initialIndex?: number;
  businessName?: string;
  /** Max thumbnails in the side grid (1–3). Default 3. */
  maxSideThumbnails?: number;
  enableShare?: boolean;
  enableFavorite?: boolean;
  onShare?: () => void;
  onFavorite?: () => void;
  onBack?: () => void;
  /** Optional: render custom favorite control (e.g. FavoriteButton) instead of onFavorite */
  renderFavorite?: () => ReactNode;
}
