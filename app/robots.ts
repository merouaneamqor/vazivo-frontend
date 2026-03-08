import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vazivo.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/provider/",
          "/api/",
          "/bookings/",
          "/booking/",
          "/book/",
          "/account/",
          "/checkout/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/search",
          "/recherche",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
