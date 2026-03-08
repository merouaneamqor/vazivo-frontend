"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PROVIDER_REGISTER_CAROUSEL_IMAGES } from "@/lib/provider-register-carousel";

const CAROUSEL_IMAGES = PROVIDER_REGISTER_CAROUSEL_IMAGES;
const SLIDE_INTERVAL_MS = 4500;

export function ProviderRegisterParallaxPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    CAROUSEL_IMAGES.forEach(({ src }) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const currentImage = CAROUSEL_IMAGES[currentIndex];

  return (
    <div className="hidden lg:flex flex-[0.9] min-h-0 min-w-0 bg-gradient-warm items-center justify-center relative overflow-hidden  shadow-sm">
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              className="object-cover"
              sizes="50vw"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-primary-600/40 mix-blend-multiply" aria-hidden />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={[
              "h-2 rounded-full transition-all duration-300",
              i === currentIndex ? "w-6 bg-primary-600" : "w-2 bg-white/60 hover:bg-white/80",
            ].join(" ")}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
