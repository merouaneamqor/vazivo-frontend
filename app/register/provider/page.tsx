"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function ProviderRegisterLanding() {
  const t = useTranslations("providerRegister.landing");
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const benefits = [
    {
      icon: Calendar,
      titleKey: "benefit1Title",
      descKey: "benefit1Desc",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      titleKey: "benefit2Title",
      descKey: "benefit2Desc",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      titleKey: "benefit3Title",
      descKey: "benefit3Desc",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: BarChart3,
      titleKey: "benefit4Title",
      descKey: "benefit4Desc",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const steps = [
    { number: "01", titleKey: "step1Label", descKey: "step1Detail", icon: Users },
    { number: "02", titleKey: "step2Label", descKey: "step2Detail", icon: Calendar },
    { number: "03", titleKey: "step3Label", descKey: "step3Detail", icon: Zap },
  ];

  const trustIndicators = [
    { value: "10K+", label: t("activeProviders") },
    { value: "500K+", label: t("monthlyBookings") },
    { value: "4.9/5", label: t("providerRating") },
    { value: "99.9%", label: t("uptime") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vazivo-lightGray/40 via-vazivo-red/5 to-vazivo-lightGray/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vazivo-red/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-vazivo-red/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vazivo-white/80 backdrop-blur-sm border border-vazivo-red/30 mb-6"
              >
                <Sparkles className="h-4 w-4 text-vazivo-red" />
                <span className="text-sm font-medium text-vazivo-red">
                  {t("joinProfessionals")}
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-vazivo-charcoal mb-6 leading-tight">
                {t("heroTitle")}{" "}
                <span className="bg-gradient-to-r from-vazivo-red to-vazivo-redLight bg-clip-text text-transparent">
                  {t("heroTitle").split(" ").pop()}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-vazivo-warmMuted mb-8 leading-relaxed">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/register/provider/form">
                  <Button size="lg" className="w-full sm:w-auto group shadow-lg hover:shadow-xl bg-vazivo-red hover:bg-vazivo-redLight text-vazivo-white">
                    {t("startFreeTrial")}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-vazivo-lightGray hover:border-vazivo-red/40 hover:text-vazivo-red hover:bg-vazivo-red/5">
                  {t("watchDemo")}
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-vazivo-warmMuted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{t("freeTrial")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{t("noCreditCard")}</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-vazivo-white rounded-3xl shadow-2xl p-8 border border-vazivo-lightGray">
                  <div className="flex items-center gap-3 mb-6">
                    <Logo variant="icon" size="lg" />
                    <div>
                      <div className="font-semibold text-vazivo-charcoal">{t("yourBusiness")}</div>
                      <div className="text-sm text-vazivo-warmMuted">{t("dashboardPreview")}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: t("bookings"), value: "+156", color: "blue" },
                      { label: t("revenue"), value: "$12.4K", color: "green" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-vazivo-lightGray/50 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-vazivo-charcoal">{stat.value}</div>
                        <div className="text-sm text-vazivo-warmMuted">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-vazivo-lightGray/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-vazivo-red/10" />
                        <div className="flex-1">
                          <div className="h-3 bg-vazivo-lightGray rounded w-3/4 mb-2" />
                          <div className="h-2 bg-vazivo-lightGray rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-vazivo-white rounded-2xl shadow-xl p-4 border border-vazivo-lightGray"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-sm font-semibold text-vazivo-charcoal">4.9/5</div>
                      <div className="text-xs text-vazivo-warmMuted">Rating</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-vazivo-white/50 backdrop-blur-sm border-y border-vazivo-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-vazivo-charcoal mb-2">
                  {item.value}
                </div>
                <div className="text-sm text-vazivo-warmMuted">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-vazivo-charcoal mb-4">
              {t("everythingYouNeed")}
            </h2>
            <p className="text-lg text-vazivo-warmMuted max-w-2xl mx-auto">
              {t("powerfulTools")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onHoverStart={() => setHoveredFeature(i)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="relative group"
                >
                  <div className="bg-vazivo-white rounded-2xl p-8 border border-vazivo-lightGray h-full hover:shadow-2xl hover:border-vazivo-red/30 transition-all duration-300">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-vazivo-charcoal mb-3">
                      {t(benefit.titleKey)}
                    </h3>
                    <p className="text-vazivo-warmMuted leading-relaxed">
                      {t(benefit.descKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-vazivo-red/5 to-vazivo-lightGray/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-vazivo-charcoal mb-4">
              {t("getStartedMinutes")}
            </h2>
            <p className="text-lg text-vazivo-warmMuted">
              {t("simpleSetup")}
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vazivo-red to-vazivo-redLight flex items-center justify-center text-vazivo-white font-bold text-xl shadow-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 bg-vazivo-white rounded-2xl p-8 border border-vazivo-lightGray">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="h-6 w-6 text-vazivo-red" />
                      <h3 className="text-2xl font-semibold text-vazivo-charcoal">
                        {t(step.titleKey)}
                      </h3>
                    </div>
                    <p className="text-vazivo-warmMuted leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vazivo-red via-vazivo-redLight to-vazivo-red" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-vazivo-white mb-6">
              {t("readyToGrow")}
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              {t("joinThousands")}
            </p>
            
            <Link href="/register/provider/form">
              <Button
                size="lg"
                className="bg-vazivo-white text-vazivo-red hover:bg-vazivo-lightGray shadow-2xl text-lg px-8 py-6 h-auto"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>

            <p className="text-white/80 text-sm mt-6">
              {t("noCreditCard")} • {t("freeTrial")} • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
