"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function VazivoCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-vazivo-red to-vazivo-rust">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-white/90 text-sm font-medium uppercase tracking-widest mb-4">
          The OpenTable for emerging markets.
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
          Discover vibrant places to eat.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-lg text-white/90 mb-10 max-w-xl mx-auto">
          Find and book the best restaurants instantly with Vazivo.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Button size="lg" className="bg-white text-vazivo-red hover:bg-white/95 font-semibold rounded-xl shadow-vazivo-hover px-8" asChild>
            <a href="/search">Get started — it&apos;s free</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
