/**
 * Vercel Edge Config Client — Singleton
 *
 * Creates a single Edge Config client instance shared across the application.
 * Works on Node.js runtime, Edge Runtime, and browser (read-only).
 *
 * The EDGE_CONFIG environment variable is automatically set by Vercel when
 * you link an Edge Config store to your project in the Vercel Dashboard.
 *
 * @module src/shared/flags/edge-config
 * @see https://vercel.com/docs/storage/edge-config
 */

import { createClient } from "@vercel/edge-config";

/**
 * Singleton Edge Config client.
 *
 * Usage:
 *   import { edgeConfig } from "@/shared/flags/edge-config";
 *   const value = await edgeConfig.get<boolean>("my-flag");
 */
export const edgeConfig = createClient(
  process.env.EDGE_CONFIG ?? ""
);
