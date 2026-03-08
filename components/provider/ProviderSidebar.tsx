"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  ClipboardList,
  Star,
  Users,
  Camera,
  TrendingUp,
  Building2,
  Settings,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { useProviderPremium } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ProviderSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  labelKey: "dashboard" | "calendar" | "catalog" | "services" | "bookings" | "reviews" | "staff" | "photos" | "statistics" | "businesses" | "settings" | "invoices";
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
  /** If true, this page requires premium access */
  premium?: boolean;
}

const menuItems: MenuItem[] = [
  { labelKey: "dashboard", href: "/provider", icon: LayoutDashboard, roles: ["provider", "admin", "superadmin"] },
  { labelKey: "calendar", href: "/provider/calendar", icon: Calendar, roles: ["provider", "admin", "superadmin"], premium: true },
  { labelKey: "catalog", href: "/provider/catalog", icon: Scissors, roles: ["provider", "admin", "superadmin"], premium: true },
  { labelKey: "bookings", href: "/provider/bookings", icon: ClipboardList, roles: ["provider", "admin", "superadmin"], premium: true },
  { labelKey: "reviews", href: "/provider/reviews", icon: Star, roles: ["provider", "admin", "superadmin"], premium: true },
  { labelKey: "staff", href: "/provider/staff", icon: Users, roles: ["provider", "admin", "superadmin"], premium: true },
  { labelKey: "photos", href: "/provider/photos", icon: Camera, roles: ["provider", "admin", "superadmin"], premium: true },
  { labelKey: "statistics", href: "/provider/statistics", icon: TrendingUp, roles: ["provider", "admin", "superadmin"] },
  { labelKey: "businesses", href: "/provider/businesses", icon: Building2, roles: ["provider", "admin", "superadmin"] },
  { labelKey: "settings", href: "/provider/settings", icon: Settings, roles: ["provider", "admin", "superadmin"] },
  { labelKey: "invoices", href: "/provider/invoices", icon: Receipt, roles: ["provider", "admin", "superadmin"] },
];

export function ProviderSidebar({
  isMobileOpen = false,
  onMobileClose,
}: ProviderSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("providerSidebar");
  const { role: effectiveRole } = useAuth();
  const isPremium = useProviderPremium();
  const { businesses, selectedBusinessId, setSelectedBusinessId, selectedBusiness } = useProviderBusiness();
  
  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("provider-sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("provider-sidebar-collapsed", String(newState));
  };

  // Filter menu items based on user role
  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(effectiveRole || "customer")
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header with toggle */}
      <div className={cn(
        "px-4 py-4 border-b border-neutral-200 flex items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link
            href="/provider"
            className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
            onClick={onMobileClose}
          >
            {t("title")}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 hidden lg:flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-4 space-y-0.5 overflow-y-auto",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/provider" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={isCollapsed ? t(item.labelKey) : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 group",
                isActive
                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 font-medium",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-neutral-700" : "text-neutral-400 group-hover:text-neutral-600"
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {item.premium && !isPremium && (
                    <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-shrink-0 grow-0 border-r border-neutral-200 bg-white transition-all duration-300 overflow-hidden h-full min-h-0",
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={onMobileClose}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label={t("closeMenu")}
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
