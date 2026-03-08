/**
 * Admin Role — Public API
 * @module src/roles/admin
 */

export { AdminShell } from "./AdminShell";

// Re-export underlying primitives for any admin-specific overrides
export { AdminSidebar } from "@/components/admin/AdminSidebar";
export { AdminTopbar }  from "@/components/admin/AdminTopbar";
