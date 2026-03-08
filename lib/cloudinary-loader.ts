import type { ImageLoaderProps } from "next/image";

const CLOUD_NAME = "dqssnduni";

function getApiOrigin(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  return url.replace(/\/api\/v1.*$/, "");
}

/** Max width to request from Cloudinary; avoids 2x–4K requests and speeds up gallery load. */
const MAX_WIDTH = 1200;

/**
 * Next.js ImageLoader for Cloudinary.
 * Caps width for faster loads; resize/crop + f_auto/q_auto (no heavy effect by default).
 */
export function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  if (!src || src.startsWith("data:")) return src;
  if (src.startsWith("http") && !src.includes("res.cloudinary.com")) return src;

  if (src.startsWith("/") && (src.includes("rails") || src.includes("active_storage") || src.includes("/blobs/"))) {
    return `${getApiOrigin()}${src}`;
  }
  // Local static assets (e.g. default placeholder from public/)
  if (src.startsWith("/")) return src;

  const w = Math.min(Number(width) || MAX_WIDTH, MAX_WIDTH);
  const base = src.startsWith("http")
    ? src
    : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${src}`;

  if (base.includes("res.cloudinary.com") && base.includes("/upload/")) {
    const transform = `w_${w},ar_1:1,c_fill,g_auto/f_auto,q_auto:good`;
    const afterUpload = base.slice(base.indexOf("/upload/") + "/upload/".length);
    const hasTransform = /^[^/]*(?:w_|f_|c_|ar_|g_|e_)[^/]*\//.test(afterUpload);
    if (hasTransform) {
      return base.replace(/\/upload\/(?:[^/]*(?:w_|f_|c_|ar_|g_|e_|q_)[^/]*\/)+/, `/upload/${transform}/`);
    }
    return base.replace("/upload/", `/upload/${transform}/`);
  }

  return base;
}
