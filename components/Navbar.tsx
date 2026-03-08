"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  User,
  Calendar,
  Building2,
  LogOut,
  Search,
  Heart,
  Home,
  Settings,
  Shield,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommandK } from "@/hooks/useCommandK";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { GlobalSearch } from "@/components/search";
import { ProviderGlobalSearch } from "@/components/provider/search";
import { cn, getInitials, getBusinessPath } from "@/lib/utils";
import { roleFromUser, isAdminRole, isProviderOrAdminRole } from "@/lib/roles";
import { useProviderBusiness, useProviderBusinessOptional } from "@/context/ProviderBusinessContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const check = () => {
      const on = typeof document !== "undefined" && document.cookie.includes("impersonating=true");
      setIsImpersonating(!!on);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const exitImpersonation = async () => {
    try {
      const res = await fetch("/api/v1/admin/exit_impersonation", { method: "POST", credentials: "include" });
      if (res.ok) {
        document.cookie = "impersonating=; path=/; max-age=0";
        document.cookie = "impersonated_user=; path=/; max-age=0";
        window.location.href = "/admin/providers";
      }
    } catch (e) {
      console.error("Exit impersonation failed", e);
    }
  };

  const role = roleFromUser(user);
  const isProvider = isProviderOrAdminRole(role);
  const isAdmin = isAdminRole(role);
  
  // Get business for providers
  const providerBusinessContext = useProviderBusinessOptional();
  const selectedBusiness = providerBusinessContext?.selectedBusiness;
  
  // Build public page URL: /[city]/[category]/[slug]
  const publicPageUrl = selectedBusiness ? getBusinessPath(selectedBusiness) : null;
  
  useCommandK(() => setSearchOpen(true));
  
  // Try to get provider context (only available on provider routes)
  const providerContext = useProviderBusinessOptional();
  const businesses = providerContext?.businesses ?? [];
  const selectedBusinessId = providerContext?.selectedBusinessId;
  const setSelectedBusinessId = providerContext?.setSelectedBusinessId ?? (() => {});

  const navigation = [
    ...(!isProvider && !isAdmin ? [{ name: t("explore"), href: "/search", icon: Search }] : []),
    ...(isAuthenticated && !isProvider ? [{ name: t("bookings"), href: "/bookings", icon: Calendar }] : []),
    ...(isProvider ? [{ name: t("agenda"), href: "/provider/calendar", icon: Calendar }] : []),
    ...(isProvider ? [{ name: t("dashboard"), href: "/provider", icon: Building2 }] : []),
    ...(isAdmin ? [{ name: t("admin"), href: "/admin", icon: Shield }] : []),
  ];

  const mobileNavItems = [
    { name: t("home"), href: "/", icon: Home },
    ...(!isProvider && !isAdmin ? [{ name: t("explore"), href: "/search", icon: Search }] : []),
    { name: t("savedPlaces"), href: "/favorites", icon: Heart },
    ...(isAuthenticated && !isProvider ? [{ name: t("myBookings"), href: "/bookings", icon: Calendar }] : []),
    ...(isProvider ? [{ name: t("agenda"), href: "/provider/calendar", icon: Calendar }] : []),
    ...(isAuthenticated ? [{ name: t("myAccount"), href: "/dashboard", icon: User }] : []),
    ...(isProvider ? [{ name: t("providerDashboard"), href: "/provider", icon: Building2 }] : []),
    ...(isAdmin ? [{ name: t("admin"), href: "/admin", icon: Shield }] : []),
    ...(isAuthenticated ? [{ name: t("accountSettings"), href: "/dashboard?tab=settings", icon: Settings }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-vazivo-white border-b border-vazivo-lightGray shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">

            {/* ── Logo + Nav Group ── */}
            <div className="flex items-center gap-8 min-w-0 shrink">
              {/* Mobile menu button for providers */}
              {isProvider && (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).__toggleProviderSidebar) {
                      (window as any).__toggleProviderSidebar();
                    }
                  }}
                  className="lg:hidden p-2 rounded-lg hover:bg-vazivo-lightGray transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-vazivo-charcoal" />
                </button>
              )}
              
              <Logo href="/" size="md" className="gap-2.5" />

              {/* ── Desktop Nav ── */}
              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg transition-all",
                        isActive 
                          ? "text-vazivo-red bg-vazivo-red/10 shadow-sm" 
                          : "text-vazivo-warmMuted hover:text-vazivo-charcoal hover:bg-vazivo-lightGray"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Right Side Actions ── */}
            <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial md:flex-none justify-end">
              {/* Search bar - matches control group: h-10, rounded-lg, border */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 h-10 px-3 bg-vazivo-white border border-vazivo-lightGray rounded-lg hover:border-vazivo-charcoal/20 hover:bg-vazivo-lightGray/50 transition-colors min-w-0 max-w-[220px] lg:max-w-[260px] shrink"
                aria-label={t("search")}
              >
                <Search className="h-4 w-4 text-vazivo-warmMuted shrink-0" aria-hidden />
                <span className="text-sm font-medium text-vazivo-charcoal truncate text-left min-w-0">{t("search")}</span>
                <kbd className="hidden lg:inline-flex shrink-0 px-2 py-0.5 text-xs font-medium text-vazivo-warmMuted bg-vazivo-lightGray border border-vazivo-lightGray rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Language Switcher - same control style */}
              <div className="hidden sm:block">
                <LocaleSwitcher />
              </div>

              {/* Business Selector for Providers */}
              {businesses.length > 1 && (
                <Select
                  value={selectedBusinessId?.toString()}
                  onValueChange={(val) => setSelectedBusinessId(parseInt(val))}
                >
                  <SelectTrigger className={cn(
                    "flex items-center gap-2 h-10 pl-3 pr-3 rounded-lg transition-colors border border-vazivo-lightGray hover:border-vazivo-charcoal/20 hover:bg-vazivo-lightGray/50 w-auto min-w-[160px]"
                  )}>
                    <div className="h-8 w-8 rounded-full bg-vazivo-red/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-vazivo-red" />
                    </div>
                    <span className="text-sm font-medium text-vazivo-charcoal max-w-[120px] truncate">
                      {businesses.find(b => b.id === selectedBusinessId)?.name || "Select business"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id.toString()}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* ── Auth State ── */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 h-10 pl-2 pr-3 rounded-lg transition-colors border relative",
                      userMenuOpen
                        ? "border-vazivo-lightGray bg-vazivo-white shadow-sm"
                        : "border-vazivo-lightGray hover:border-vazivo-charcoal/20 hover:bg-vazivo-lightGray/50",
                      isImpersonating && "border-amber-400 ring-1 ring-amber-200"
                    )}
                    aria-label={userMenuOpen ? t("closeAccountMenu") : t("openAccountMenu")}
                    aria-expanded={userMenuOpen}
                  >
                    <span className="relative shrink-0 flex items-center justify-center">
                      {isImpersonating ? (
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-amber-200"
                          aria-hidden
                        >
                          <AlertTriangle className="h-4 w-4 fill-current" />
                        </span>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar_url} alt={user?.name} />
                          <AvatarFallback className="text-xs font-semibold bg-vazivo-red/10 text-vazivo-red">
                            {getInitials(user?.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </span>
<span className="hidden lg:block text-sm font-medium text-vazivo-charcoal max-w-[80px] truncate">
                    {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-vazivo-warmMuted transition-transform",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-[220px] rounded-2xl py-1.5 z-[9999] bg-vazivo-white border border-vazivo-lightGray shadow-lg">
                        <div className="px-4 py-3 mb-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarImage src={user?.avatar_url} alt={user?.name} />
                              <AvatarFallback className="text-xs font-semibold bg-vazivo-red/10 text-vazivo-red">
                                {getInitials(user?.name || "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-vazivo-charcoal truncate">{user?.name}</p>
                              <p className="text-[11px] text-vazivo-warmMuted truncate">{user?.email}</p>
                            </div>
                            </div>
                          </div>

                          <div className="h-px mx-3 mb-1.5 bg-vazivo-lightGray" />

                          {[
                            { href: "/dashboard", icon: User, label: t("myAccount") },
                            ...(isProvider ? [{ href: "/provider/calendar", icon: Calendar, label: t("agenda") }] : [{ href: "/bookings", icon: Calendar, label: t("myBookings") }]),
                            { href: "/favorites", icon: Heart, label: t("savedPlaces") },
                            ...(isProvider ? [{ href: "/provider", icon: Building2, label: t("providerDashboard") }] : []),
                            ...(user?.role === "customer" ? [{ href: "/upgrade-to-provider", icon: Building2, label: "Become a Provider" }] : []),
                            ...(isAdmin ? [{ href: "/admin", icon: Shield, label: t("admin") }] : []),
                          ].map((item) => {
                            const Icon = item.icon;
                            const isExternal = item.href.startsWith("http");
                            const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
                            
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                {...linkProps}
                                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-vazivo-warmMuted hover:text-vazivo-charcoal hover:bg-vazivo-lightGray transition-colors mx-1.5 "
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <Icon className="w-3.5 h-3.5 text-vazivo-warmMuted flex-shrink-0" />
                                {item.label}
                              </Link>
                            );
                          })}

                          {isProvider && publicPageUrl && (
                            <>
                              <div className="h-px mx-3 my-1.5 bg-vazivo-lightGray" />
                              <Link
                                href={publicPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-vazivo-warmMuted hover:text-vazivo-charcoal hover:bg-vazivo-lightGray transition-colors mx-1.5"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <svg className="w-3.5 h-3.5 text-vazivo-warmMuted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Public Page
                              </Link>
                            </>
                          )}

                          {isImpersonating && (
                            <>
                              <div className="h-px mx-3 my-1.5 bg-vazivo-lightGray" />
                              <button
                                type="button"
                                onClick={() => { setUserMenuOpen(false); exitImpersonation(); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 transition-colors mx-1.5"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                Exit impersonation
                              </button>
                            </>
                          )}

                          <div className="h-px mx-3 my-1.5 bg-vazivo-lightGray" />

                          <button
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            disabled={isLoggingOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-error-600 hover:bg-error-50 transition-colors mx-1.5 "
                            style={{ width: "calc(100% - 12px)" }}
                          >
                            <LogOut className="w-4 h-4" />
                            {isLoggingOut ? "…" : t("logout")}
                          </button>
                        </div>
                      </>
                    )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-vazivo-charcoal hover:text-vazivo-charcoal rounded-lg border border-vazivo-lightGray bg-vazivo-white hover:border-vazivo-charcoal/20 hover:bg-vazivo-lightGray transition-colors whitespace-nowrap"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register/provider"
                    className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold text-vazivo-white rounded-lg bg-vazivo-red hover:bg-vazivo-redLight transition-colors shadow-sm whitespace-nowrap"
                  >
                    {t("forBusiness")}
                  </Link>
                </div>
              )}

              {/* ── Hamburger ── */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-vazivo-charcoal hover:bg-vazivo-lightGray transition-colors touch-manipulation"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-vazivo-white z-[9999] md:hidden shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-vazivo-lightGray">
                <Logo href="/" variant="icon" size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-vazivo-charcoal hover:bg-vazivo-lightGray transition-colors touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="px-3 py-4 space-y-1">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation",
                        isActive
                          ? "text-vazivo-charcoal bg-vazivo-red/10"
                          : "text-vazivo-warmMuted hover:text-vazivo-charcoal hover:bg-vazivo-lightGray"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Auth Section */}
              <div className="px-4 pb-6 pt-4 border-t border-vazivo-lightGray mt-auto">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    disabled={isLoggingOut}
                    className="flex items-center justify-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors touch-manipulation"
                  >
                    <LogOut className="h-5 w-5" />
                    {isLoggingOut ? "…" : t("logout")}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full py-3.5 text-sm font-medium text-vazivo-charcoal bg-vazivo-white border-2 border-vazivo-lightGray rounded-xl hover:bg-vazivo-lightGray transition-colors touch-manipulation">
                        {t("login")}
                      </button>
                    </Link>
                    <Link href="/register/provider" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full py-3.5 text-sm font-semibold text-vazivo-white rounded-xl bg-vazivo-red hover:bg-vazivo-redLight transition-all shadow-md touch-manipulation">
                        {t("forBusiness")}
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
        </>
      )}

      {/* Global Search Modal */}
      {!isProvider && (
        <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
      {isProvider && (
        <ProviderGlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}