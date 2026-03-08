/**
 * Fetch admin-managed SEO overrides for a given path.
 * Returns null when no override exists.
 * Used in generateMetadata() for listing and place pages.
 */

import { getApiBaseUrl } from "@/lib/business-server";

export interface SeoOverride {
  path: string;
  title?: string | null;
  meta_description?: string | null;
  seo_text?: string | null;
  city?: string | null;
  service?: string | null;
}

export async function getSeoOverride(path: string): Promise<SeoOverride | null> {
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!normalized) return null;

  try {
    const url = `${getApiBaseUrl()}/public/seo_pages?path=${encodeURIComponent(normalized)}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.path) return null;
    return data as SeoOverride;
  } catch {
    return null;
  }
}
