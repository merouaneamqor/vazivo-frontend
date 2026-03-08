/**
 * Image optimization utilities for responsive images and lazy loading
 */

export interface ResponsiveImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
}

/**
 * Generate responsive sizes string for Next.js Image component
 * Optimizes for different breakpoints and device pixel ratios
 */
export const getResponsiveSizes = (context: "hero" | "card" | "thumbnail" | "profile") => {
  const sizesMap = {
    hero: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    thumbnail: "(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px",
    profile: "(max-width: 640px) 120px, (max-width: 1024px) 150px, 200px",
  };
  return sizesMap[context];
};

/**
 * Generate Cloudinary URL with optimization parameters
 */
export const generateOptimizedCloudinaryUrl = (
  baseUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: "auto" | "low" | "medium" | "high";
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "fill" | "fit" | "scale";
    gravity?: "auto" | "face" | "center";
  }
): string => {
  if (!baseUrl) return "";

  const params = new URLSearchParams();

  // Add optimization parameters
  if (options?.width) params.append("w", options.width.toString());
  if (options?.height) params.append("h", options.height.toString());
  params.append("q", options?.quality || "auto");
  params.append("f", options?.format || "auto");
  params.append("c", options?.crop || "fill");
  if (options?.gravity) params.append("g", options.gravity);

  // Add automatic quality and format negotiation
  params.append("dpr", "auto");

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${params.toString()}`;
};

/**
 * Generate blur placeholder for images (low quality image placeholder)
 */
export const generateBlurDataURL = (src: string): string => {
  // This would typically be generated at build time
  // For now, return a simple placeholder
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect fill='%23f0f0f0' width='1200' height='800'/%3E%3C/svg%3E";
};

/**
 * Image quality settings based on context
 */
export const imageQualitySettings = {
  hero: { quality: 80, format: "auto" as const, crop: "fill" as const },
  card: { quality: 75, format: "auto" as const, crop: "fill" as const },
  thumbnail: { quality: 70, format: "auto" as const, crop: "fill" as const },
  profile: { quality: 85, format: "auto" as const, crop: "fill" as const },
  thumbnail_avatar: { quality: 80, format: "auto" as const, crop: "scale" as const },
};

/**
 * Recommended image dimensions for different contexts
 */
export const imageDimensions = {
  hero: { width: 1200, height: 400 },
  card: { width: 400, height: 300 },
  thumbnail: { width: 150, height: 150 },
  profile: { width: 300, height: 300 },
  thumbnail_avatar: { width: 80, height: 80 },
};

/**
 * Preload critical images for faster LCP
 */
export const getCriticalImagePreload = (src: string) => {
  return {
    rel: "preload",
    as: "image",
    href: src,
    imagesrcset: src,
  };
};

/**
 * Get WebP fallback for older browsers
 */
export const getImageWithFallback = (
  cloudinaryUrl: string,
  options?: { width?: number; height?: number }
) => {
  const webp = generateOptimizedCloudinaryUrl(cloudinaryUrl, {
    ...options,
    format: "webp",
  });

  const jpg = generateOptimizedCloudinaryUrl(cloudinaryUrl, {
    ...options,
    format: "jpg",
  });

  return { webp, jpg };
};
