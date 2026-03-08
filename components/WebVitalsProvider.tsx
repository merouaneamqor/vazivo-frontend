"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/web-vitals";

/**
 * Web Vitals tracking provider
 * Tracks Core Web Vitals and sends data to analytics endpoint
 * Uses web-vitals v5 API: onCLS, onINP, onLCP, onFCP, onTTFB
 */
export function WebVitalsProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("web-vitals")
      .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        onCLS(reportWebVitals);
        onINP(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
      })
      .catch(() => {
        // web-vitals may be missing in some environments; ignore
      });
  }, []);

  return null;
}
