/**
 * Web Vitals tracking for Core Web Vitals monitoring
 * LCP (Largest Contentful Paint): Measures loading performance
 * FID (First Input Delay): Measures interactivity
 * CLS (Cumulative Layout Shift): Measures visual stability
 */

interface WebVitals {
  name: string;
  value: number;
  rating: "good" | "ni" | "poor";
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Send Web Vitals data to analytics service
 */
export const reportWebVitals = (metric: any) => {
  // Only send in production
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  // Prepare the data
  const body = {
    name: metric.name,
    value: metric.rating === "good" ? metric.value : null,
    rating: metric.rating,
    navigationType: metric.navigationType,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", JSON.stringify(body));
  } else {
    fetch("/api/vitals", {
      body: JSON.stringify(body),
      method: "POST",
      credentials: "omit",
      keepalive: true,
    }).catch(() => {
      // Silently fail if vitals endpoint is unavailable
    });
  }
};

/**
 * Get thresholds for Web Vitals
 */
const vitalsThresholds = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 600, poor: 1200 }, // Time to First Byte
};

/**
 * Get rating for a metric based on thresholds
 */
const getMetricRating = (
  name: string,
  value: number
): "good" | "ni" | "poor" => {
  const threshold =
    vitalsThresholds[name as keyof typeof vitalsThresholds];

  if (!threshold) return "ni";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "ni";
  return "poor";
};
