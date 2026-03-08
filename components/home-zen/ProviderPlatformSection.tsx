"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Calendar, Bell, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/button";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function ProviderPlatformSection() {
  const t = useTranslations("home");

  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-primary-50 via-white to-primary-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-6">
              {t("providerPlatformTitle")}
            </h2>
            <p className="text-lg md:text-xl text-neutral-700 mb-8 leading-relaxed">
              {t("providerPlatformDesc")}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-neutral-700">{t("providerFeature1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-neutral-700">{t("providerFeature2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-neutral-700">{t("providerFeature3")}</span>
              </div>
            </div>

            <Link href="/register/provider">
              <Button size="lg" className="group">
                {t("createFreeAccount")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <div className="relative max-w-md mx-auto lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: -3 }}
              whileHover={{ rotate: -1, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">Février 2026</h3>
                    <p className="text-xs text-neutral-500">Vue mensuelle</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-600 rotate-180" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-3">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                    <div key={day} className="text-center text-[10px] font-semibold text-neutral-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  
                  {[
                    { day: 1, bookings: 0 },
                    { day: 2, bookings: 2 },
                    { day: 3, bookings: 1 },
                    { day: 4, bookings: 3 },
                    { day: 5, bookings: 1 },
                    { day: 6, bookings: 0 },
                    { day: 7, bookings: 2 },
                    { day: 8, bookings: 4, today: true },
                    { day: 9, bookings: 2 },
                    { day: 10, bookings: 1 },
                    { day: 11, bookings: 3 },
                    { day: 12, bookings: 2 },
                    { day: 13, bookings: 1 },
                    { day: 14, bookings: 0 },
                  ].map(({ day, bookings, today }) => (
                    <div
                      key={day}
                      className={cn(
                        "aspect-square rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all",
                        today
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-primary-300",
                        bookings > 0 && "bg-green-50 border-green-200"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        today ? "text-primary-600" : "text-neutral-700"
                      )}>
                        {day}
                      </span>
                      {bookings > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: Math.min(bookings, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full bg-green-500"
                            />
                          ))}
                          {bookings > 3 && (
                            <span className="text-[7px] text-green-600 font-medium">+{bookings - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 4 }}
              whileInView={{ opacity: 1, y: 0, rotate: 4 }}
              whileHover={{ rotate: 2, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative z-20 -mt-8 ml-8"
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-neutral-200">
                <h4 className="text-xs font-semibold text-neutral-900 mb-3">Aujourd'hui - 8 Février</h4>
                <div className="space-y-1.5">
                  {[
                    { time: "09:00", name: "Fatima Z.", service: "Coupe de cheveux", status: "confirmed" },
                    { time: "11:30", name: "Ahmed M.", service: "Barbe", status: "confirmed" },
                    { time: "14:00", name: "Sara K.", service: "Coloration", status: "pending" },
                    { time: "16:30", name: "Youssef A.", service: "Coupe homme", status: "confirmed" },
                  ].map((booking, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="text-[10px] font-medium text-neutral-600 w-10">{booking.time}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-neutral-900 truncate">{booking.name}</div>
                        <div className="text-[10px] text-neutral-500 truncate">{booking.service}</div>
                      </div>
                      <div className={cn(
                        "px-1.5 py-0.5 rounded-lg text-[9px] font-medium",
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}>
                        {booking.status === "confirmed" ? "Confirmé" : "En attente"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
