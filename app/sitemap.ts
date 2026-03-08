import { MetadataRoute } from "next";
import { getBusinessPath } from "@/lib/utils";
import { getAllBlogSlugs } from "@/lib/blog";

const PER_PAGE = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vazivo.com";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.vazivo.com/api/v1";

  // Main pages
  const routes = [
    { path: "", priority: 1.0 },
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/how-it-works", priority: 0.6 },
    { path: "/business", priority: 0.7 },
    { path: "/blog", priority: 0.8 },
    { path: "/terms", priority: 0.3 },
    { path: "/privacy", priority: 0.3 },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));

  // Blog articles (static + programmatic city guides + avis pages)
  const blogSlugs = getAllBlogSlugs();
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // Cities and categories from backend (for /search/city and /category/city URLs)
  let citySlugs: string[] = [];
  let categorySlugs: string[] = [];
  try {
    const filtersRes = await fetch(`${apiUrl}/public/search_metadata/filters`, {
      next: { revalidate: 3600 },
    });
    if (filtersRes.ok) {
      const filters = await filtersRes.json();
      citySlugs = (filters.cities || []).map((c: { slug: string }) => c.slug).filter(Boolean);
      categorySlugs = (filters.categories || []).map((c: { slug: string }) => c.slug).filter(Boolean);
    }
  } catch (e) {
    console.error("[Sitemap] Failed to fetch search metadata:", e);
  }

  const cities = citySlugs.map((city) => ({
    url: `${baseUrl}/search/${city}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Doctolib-style category+city listing URLs (e.g. /coiffeur/casablanca)
  const categoryCityPages: MetadataRoute.Sitemap = [];
  for (const cat of categorySlugs) {
    for (const city of citySlugs) {
      categoryCityPages.push({
        url: `${baseUrl}/${cat}/${city}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      });
    }
  }

  // Fetch all businesses (paginate until no more) for dynamic business pages
  const businessPages: MetadataRoute.Sitemap = [];
  try {
    let page = 1;
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      const response = await fetch(
        `${apiUrl}/public/businesses?per_page=${PER_PAGE}&page=${page}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        console.error(`Failed to fetch page ${page}:`, response.statusText);
        break;
      }

      const data = await response.json();
      const businesses = data.businesses || [];
      const meta = data.meta || {};

      if (!businesses || businesses.length === 0) {
        break;
      }

      for (const b of businesses) {
        if (!b?.slug) continue;
        const path = getBusinessPath({
          city: b.city ?? null,
          category: b.category ?? null,
          slug: b.slug,
        });
        businessPages.push({
          url: `${baseUrl}${path}`,
          lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
        totalFetched++;
      }

      // Check if we've reached the end by comparing current page with total pages
      const currentPage = meta.current_page ?? page;
      const totalPages = meta.total_pages ?? 1;
      
      hasMore = currentPage < totalPages;
      page += 1;

      console.log(`[Sitemap] Fetched page ${currentPage}/${totalPages}, total businesses: ${totalFetched}`);
    }
    
    console.log(`[Sitemap] Total businesses indexed: ${totalFetched}`);
  } catch (error) {
    console.error("Failed to fetch businesses for sitemap:", error);
  }

  return [...routes, ...blogPages, ...cities, ...categoryCityPages, ...businessPages];
}
