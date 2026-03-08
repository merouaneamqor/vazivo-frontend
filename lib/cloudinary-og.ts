const CLOUD_NAME = "dqssnduni";

/**
 * Build Cloudinary OG image URL (1200x630). Minimal transform + f_auto/q_auto in separate components for cache.
 * See https://cloudinary.com/documentation/cloudinary_transformation_rules
 */
export function cloudinaryOgUrl(secureUrl: string | undefined, options?: { width?: number; height?: number }): string {
  const w = options?.width ?? 1200;
  const h = options?.height ?? 630;
  const transform = `w_${w},h_${h},c_fill,g_auto/e_art:hokusai/f_auto/q_auto`;
  if (!secureUrl || !secureUrl.includes("res.cloudinary.com")) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/sample`;
  }
  if (secureUrl.includes("/upload/")) {
    const afterUpload = secureUrl.slice(secureUrl.indexOf("/upload/") + "/upload/".length);
    const hasTransform = /^[^/]*(?:w_|f_|c_|ar_|g_|e_)[^/]*\//.test(afterUpload);
    if (hasTransform) {
      return secureUrl.replace(/\/upload\/(?:[^/]*(?:w_|f_|c_|ar_|g_|e_|q_)[^/]*\/)+/, `/upload/${transform}/`);
    }
    return secureUrl.replace("/upload/", `/upload/${transform}/`);
  }
  return secureUrl;
}
