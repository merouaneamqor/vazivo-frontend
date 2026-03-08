"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  Layers,
  MessageCircle,
  Users,
  Image as ImageIcon,
  Crown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useProviderPremium } from "@/store/auth";

const PREMIUM_BENEFITS = [
  { icon: Calendar, key: "calendar" },
  { icon: CalendarDays, key: "bookings" },
  { icon: Layers, key: "services" },
  { icon: MessageCircle, key: "reviews" },
  { icon: Users, key: "team" },
  { icon: ImageIcon, key: "photos" },
] as const;

interface ProviderPremiumGateProps {
  children: React.ReactNode;
  /** Called when the user clicks "Upgrade to Premium" */
  onUpgradeClick?: () => void;
}

/**
 * Wraps premium-only page content. If the provider is premium, renders children
 * normally. If not, shows a premium banner + blurred preview + upgrade CTA.
 */
export function ProviderPremiumGate({
  children,
  onUpgradeClick,
}: ProviderPremiumGateProps) {
  const isPremium = useProviderPremium();
  const t = useTranslations("providerPremium");

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* ── Premium Banner ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6"
      >
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 md:p-8 text-white shadow-lg shadow-primary-600/20 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left: Icon + Title */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Crown className="h-5 w-5 text-amber-300" />
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="text-xs font-semibold tracking-wider uppercase text-primary-200">
                    {t("badge")}
                  </span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-display font-bold mb-2">
                {t("title")}
              </h2>
              <p className="text-primary-100 text-sm md:text-base max-w-lg">
                {t("description")}
              </p>
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={onUpgradeClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-700 font-bold text-sm hover:bg-primary-50 transition-colors shadow-lg shadow-black/10 group"
              >
                {t("upgradeCta")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Benefits row */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {PREMIUM_BENEFITS.map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-sm text-white/90"
                >
                  <Icon className="h-4 w-4 text-amber-300 flex-shrink-0" />
                  <span>{t(`benefits.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Blurred Preview ─────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 z-10 rounded-2xl backdrop-blur-[6px] bg-white/40 " />

        {/* Second CTA floating on top of blur */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 text-white font-bold text-base hover:bg-primary-700 transition-colors shadow-2xl shadow-primary-600/30 group"
            >
              <Crown className="h-5 w-5 text-amber-300" />
              {t("upgradeCta")}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Actual page content (rendered but blurred / not interactive) */}
        <div
          className="pointer-events-none select-none"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
