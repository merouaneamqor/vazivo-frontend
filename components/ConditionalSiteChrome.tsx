"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { LocaleSync } from "@/components/LocaleSync";
import { ProviderBusinessProvider } from "@/context/ProviderBusinessContext";

/** Path segments where the footer should be hidden (provider, admin, customer dashboard). */
const NO_FOOTER_SEGMENTS = ["/provider", "/admin", "/dashboard"];

function useHideFooter(): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  return NO_FOOTER_SEGMENTS.some((segment) => pathname === segment || pathname.startsWith(segment + "/"));
}

/**
 * Renders site chrome (Navbar, Footer, MobileNav) for all routes.
 * Footer is hidden on provider, admin, and customer (dashboard) layouts.
 */
export default function ConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const hideFooter = useHideFooter();

  return (
    <ProviderBusinessProvider>
      <div className="flex min-h-screen flex-col">
        <LocaleSync />
        <Navbar />
        <main className="flex flex-1 flex-col min-h-0 pb-16 md:pb-0">{children}</main>
        {!hideFooter && <Footer />}
        <MobileNav />
      </div>
    </ProviderBusinessProvider>
  );
}
