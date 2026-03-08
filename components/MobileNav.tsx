"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Calendar, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useIsAuthenticated } from "@/store/auth";
import { roleFromUser, isAdminRole, isProviderOrAdminRole } from "@/lib/roles";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  requiresAuth?: boolean;
  requiresProvider?: boolean;
  requiresAdmin?: boolean;
}

export default function MobileNav() {
  const pathname = usePathname();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const role = roleFromUser(user);
  const isProvider = isProviderOrAdminRole(role);
  const isAdmin = isAdminRole(role);

  // Admin-specific nav
  if (pathname.startsWith("/admin")) {
    const adminItems: NavItem[] = [
      { href: "/admin/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
      { href: "/admin/bookings", icon: <Calendar className="h-5 w-5" />, label: "Bookings" },
      { href: "/admin/providers", icon: <Building2 className="h-5 w-5" />, label: "Providers" },
      { href: "/dashboard", icon: <User className="h-5 w-5" />, label: "Account" },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-neutral-200 pb-safe">
        <div className="flex items-center justify-around h-12">
          {adminItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
                aria-label={item.label}
              >
                <div className={cn(
                  "transition-colors",
                  isActive ? "text-neutral-900" : "text-neutral-400"
                )}>
                  {item.icon}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  const navItems: NavItem[] = [
    { href: "/", icon: <Home className="h-5 w-5" />, label: "Home" },
    { href: "/search", icon: <Search className="h-5 w-5" />, label: "Search" },
    ...(isAuthenticated ? [{ 
      href: "/bookings", 
      icon: <Calendar className="h-5 w-5" />, 
      label: "Bookings",
      requiresAuth: true 
    }] : []),
    ...(isProvider ? [{ 
      href: "/provider", 
      icon: <Building2 className="h-5 w-5" />, 
      label: "Dashboard",
      requiresProvider: true 
    }] : []),
    { 
      href: isAuthenticated ? "/dashboard" : "/login", 
      icon: <User className="h-5 w-5" />, 
      label: isAuthenticated ? "Account" : "Login" 
    },
  ];

  const visibleItems = navItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresProvider && !isProvider) return false;
    if (item.requiresAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-neutral-200 pb-safe">
      <div className="flex items-center justify-around h-12">
        {visibleItems.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
              aria-label={item.label}
            >
              <div className={cn(
                "transition-colors",
                isActive ? "text-neutral-900" : "text-neutral-400"
              )}>
                {item.icon}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
