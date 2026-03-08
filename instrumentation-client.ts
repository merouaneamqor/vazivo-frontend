// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Patch performance.measure as early as possible — before any module imports.
// Turbopack calls performance.measure('BusinessPage', ...) during streaming hydration
// with a negative timestamp (vercel/next.js#86060). This patch silences the throw.
if (
  typeof performance !== "undefined" &&
  typeof performance.measure === "function" &&
  !(performance as unknown as { _measurePatched?: boolean })._measurePatched
) {
  (performance as unknown as { _measurePatched?: boolean })._measurePatched = true;
  const _origMeasure = performance.measure.bind(performance);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (performance as any).measure = function (...args: Parameters<Performance["measure"]>) {
    try {
      return _origMeasure(...args);
    } catch {
      return undefined;
    }
  };
}

import * as Sentry from "@sentry/nextjs";

const dsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://0c8848ee7a359297db7a5c3b0825fe1e@o4505487765667840.ingest.us.sentry.io/4510850207121408";

Sentry.init({
  dsn,
  environment: process.env.NODE_ENV,

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,

  // Known Turbopack/React dev bug: performance.measure throws when a component renders
  // before its performance.mark was recorded (negative timestamp). Not a real error.
  // See: https://github.com/vercel/next.js/issues/86060
  ignoreErrors: [
    /Failed to execute 'measure' on 'Performance'.*negative time stamp/,
    "negative time stamp",
  ],

  beforeSend(event, hint) {
    const msg = String(
      (hint?.originalException as Error)?.message ??
      event.exception?.values?.[0]?.value ??
      ""
    );
    if (msg.includes("negative time stamp")) return null;
    return event;
  },
});

// Next.js instrumentation hook. Sentry 7.x does not export captureRouterTransitionStart;
// export a no-op so the instrumentation contract is satisfied.
export function onRouterTransitionStart() {}
