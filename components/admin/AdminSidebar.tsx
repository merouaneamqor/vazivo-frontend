"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Star,
  Wallet,
  FolderTree,
  Package,
  MapPin,
  Settings,
  UserCog,
  BarChart3,
  LifeBuoy,
  ClipboardList,
  X,
  Receipt,
  ChevronRight,
  FileText,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: "Overview",
    items: [
      { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { key: "reports", href: "/admin/reports", icon: BarChart3 },
      { key: "logs", href: "/admin/logs", icon: ScrollText },
    ],
  },
  {
    title: "Management",
    items: [
      { key: "bookings", href: "/admin/bookings", icon: Calendar },
      { key: "customers", href: "/admin/customers", icon: Users },
      { key: "providers", href: "/admin/providers", icon: Building2 },
      { key: "reviews", href: "/admin/reviews", icon: Star },
      { key: "claimRequests", href: "/admin/claim-requests", icon: ClipboardList },
      { key: "staff", href: "/admin/staff", icon: UserCog },
    ],
  },
  {
    title: "Finance",
    items: [
      { key: "finance", href: "/admin/finance", icon: Wallet },
      { key: "invoices", href: "/admin/invoices", icon: Receipt },
    ],
  },
  {
    title: "Configuration",
    items: [
      { key: "categories", href: "/admin/categories", icon: FolderTree },
      { key: "plans", href: "/admin/plans", icon: Package },
      { key: "cities", href: "/admin/cities", icon: MapPin },
      { key: "seoPages", href: "/admin/seo-pages", icon: FileText },
      { key: "settings", href: "/admin/settings", icon: Settings },
      { key: "support", href: "/admin/support", icon: LifeBuoy },
    ],
  },
];

export function AdminSidebar({ isMobileOpen, onMobileClose }: { isMobileOpen?: boolean; onMobileClose?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-lg font-display font-bold text-neutral-900">Admin Panel</h2>
        <p className="text-xs text-neutral-500 mt-1">Manage your platform</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary-50 text-primary-700 shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-primary-600" : "text-neutral-400"
                      )} />
                      <span>{t(item.key)}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-primary-600" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-primary-900 mb-1">Need Help?</p>
          <p className="text-xs text-primary-700 mb-3">Check our documentation</p>
          <Link 
            href="/admin/support" 
            className="text-xs font-medium text-primary-700 hover:text-primary-800 underline"
          >
            Get Support →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-neutral-200 bg-white self-stretch">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors z-10"
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
