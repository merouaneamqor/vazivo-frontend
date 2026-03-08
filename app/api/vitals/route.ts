/**
 * Web Vitals tracking endpoint
 * Receives and logs Core Web Vitals metrics for monitoring
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log vitals data (in production, send to analytics service)
    console.log("[Web Vitals]", {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      url: body.url,
      timestamp: body.timestamp,
    });

    // Optional: Send to external analytics service
    if (process.env.ANALYTICS_ENDPOINT) {
      fetch(process.env.ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "web_vitals",
          ...body,
        }),
      }).catch(() => {
        // Silently fail if analytics endpoint is unavailable
      });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Web Vitals tracking error:", error);
    return Response.json({ error: "Failed to track vitals" }, { status: 500 });
  }
}
