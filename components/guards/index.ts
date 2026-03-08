/**
 * Route Guard Exports (Client-Safe)
 *
 * This module only exports client-side guards.
 * For server-side guards, import directly from "@/components/guards/server"
 *
 * @module components/guards
 */

// Client-side guards (for client navigation & UX polish)
export {
  
  ProviderGuard,
  
  
  
} from "./RouteGuard";

// Note: Server-side guards are NOT re-exported here to avoid
// pulling server-only code into client bundles.
// Import server guards directly:
// import { ServerAdminGuard } from "@/components/guards/server";
