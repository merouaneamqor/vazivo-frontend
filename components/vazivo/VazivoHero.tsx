"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { VazivoSearchBar } from "./VazivoSearchBar";

export function VazivoHero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden bg-vazivo-cream">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-vazivo-red/20 via-transparent to-vazivo-orange/15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white/95 text-sm font-medium tracking-wide uppercase mb-4"
        >
          The OpenTable for emerging markets.
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-4 md:mb-5 max-w-4xl mx-auto leading-[1.1]"
        >
          Discover vibrant places to eat.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10 md:mb-12 font-medium"
        >
          Find and book the best restaurants instantly with Vazivo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="w-full max-w-5xl mx-auto"
        >
          <VazivoSearchBar />
        </motion.div>
      </div>
    </section>
  );
}
