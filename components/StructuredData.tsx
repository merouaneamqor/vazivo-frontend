"use client";

import Script from "next/script";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo-config";

/**
 * Global structured data for the entire site
 * Add this to the root layout
 */
export default function StructuredData() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}
