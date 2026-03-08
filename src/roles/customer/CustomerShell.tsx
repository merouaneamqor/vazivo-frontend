/**
 * Customer Role Shell
 *
 * Minimal shell for customer-facing authenticated pages.
 * The customer experience uses the global Navbar and Footer
 * (site chrome) rather than a dedicated sidebar portal. This shell
 * acts as the boundary for future customer-specific navigation
 * additions (e.g. a bottom tab bar on mobile).
 *
 * @module src/roles/customer/CustomerShell
 */

import type { ReactNode } from "react";

interface CustomerShellProps {
  children: ReactNode;
}

/**
 * CustomerShell wraps customer-only pages (bookings, favorites, account).
 * The global layout already renders Navbar and Footer, so this shell
 * focuses on content-area constraints and semantic markup.
 */
export function CustomerShell({ children }: CustomerShellProps) {
  return (
    <main className="flex-1 min-h-screen bg-neutral-50">
      {children}
    </main>
  );
}
