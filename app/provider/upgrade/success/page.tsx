"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Crown, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, useProviderPremium } from "@/store/auth";
import api from "@/lib/api";

export default function UpgradeSuccessPage() {
  const t = useTranslations("providerPremium.success");
  const router = useRouter();
  const isPremium = useProviderPremium();
  const { setUser } = useAuthStore();

  // Refetch user to pick up new premium status
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const fetchUser = async () => {
      try {
        const response = await api.getMe();
        if (response?.user) {
          setUser(response.user);
          // If premium, we're done polling
          if ((response.user as { premium?: boolean }).premium) {
            return;
          }
        }
      } catch {
        // Silently retry
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(fetchUser, 2000);
      }
    };

    fetchUser();
  }, [setUser]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto shadow-lg shadow-primary-600/30">
            <Crown className="h-10 w-10 text-amber-300" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-1 -right-1"
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-500 fill-white" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
              {t("badge")}
            </span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>

          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-3">
            {t("title")}
          </h1>

          <p className="text-neutral-600 mb-8">
            {t("description")}
          </p>

          {isPremium ? (
            <Button
              size="lg"
              onClick={() => router.push("/provider")}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold  group"
            >
              {t("goToDashboard")}
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                <div className="h-4 w-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                {t("activating")}
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/provider")}
                className="mt-2"
              >
                {t("goToDashboard")}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
