"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProviderTopbarProps {
  onMobileMenuToggle?: () => void;
}

// Map routes to breadcrumb labels (French, matches sidebar)
const routeLabels: Record<string, string> = {
  "/provider": "Ventes",
  "/provider/calendar": "Agenda",
  "/provider/bookings": "Rendez-vous",
  "/provider/services": "Prestations",
  "/provider/staff": "Membres de l'équipe",
  "/provider/invoices": "Facture",
  "/provider/reviews": "Commentaires",
  "/provider/photos": "Photos d'entreprise",
  "/provider/businesses": "Vos entreprises",
  "/provider/settings": "Parametres",
  "/provider/businesses/new": "Nouvelle entreprise",
};

export function ProviderTopbar({
  onMobileMenuToggle,
}: ProviderTopbarProps) {
  const pathname = usePathname();

  // Generate breadcrumbs
  const breadcrumbs = ["Provider"];
  const currentLabel = routeLabels[pathname];
  if (pathname !== "/provider" && currentLabel) {
    breadcrumbs.push(currentLabel);
  }

  // Edit business: Provider > Vos entreprises > Modifier
  if (pathname.includes("/businesses/") && pathname.includes("/edit")) {
    if (breadcrumbs.length === 1) breadcrumbs.push("Vos entreprises");
    breadcrumbs.push("Modifier");
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                )}
                <span
                  className={cn(
                    index === breadcrumbs.length - 1
                      ? "font-semibold text-neutral-900"
                      : "text-neutral-500"
                  )}
                >
                  {crumb}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Center: Empty space for balance */}
        <div className="flex-1"></div>

        {/* Right: Actions (user menu is in global Navbar) */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          {pathname === "/provider/services" ? (
            <Button
              size="sm"
              className="hidden sm:flex"
              type="button"
              onClick={() => {
                const el = document.getElementById("provider-add-service");
                if (el instanceof HTMLButtonElement) {
                  el.click();
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          ) : (
            <Link href="/provider/businesses/new">
              <Button size="sm" className="hidden sm:flex">
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
