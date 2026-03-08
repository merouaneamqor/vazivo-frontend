/**
 * Provider Role Shell
 *
 * Composes the full provider portal chrome (sidebar + topbar + content area).
 * Mirrors the pattern used in AdminShell; delegates to existing sidebar and
 * topbar primitives already in components/provider/.
 *
 * App-layer layout at app/provider/layout.tsx imports from here.
 *
 * @module src/roles/provider/ProviderShell
 */

"use client";

import { useState } from "react";
import { ProviderSidebar } from "@/components/provider/ProviderSidebar";
import { ProviderTopbar }  from "@/components/provider/ProviderTopbar";

/* ── Component ───────────────────────────────────────────────────────────── */

interface ProviderShellProps {
  children: React.ReactNode;
}

/**
 * ProviderShell wraps every page inside the provider portal.
 * Auth and role enforcement is handled by middleware + server layout.
 */
export function ProviderShell({ children }: ProviderShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-0">
      <ProviderSidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <ProviderTopbar onMobileMenuToggle={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}
