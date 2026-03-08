"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCities } from "@/hooks/useSearchMetadata";

// Consistent number formatting to avoid hydration mismatch
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface City {
  name: string;
  slug: string;
  business_count: number;
  imageUrl?: string;
}

// Default city images (fallback if not provided)
const defaultCityImages: Record<string, string> = {
  "Casablanca": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Marrakech": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Fes": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Tangier": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Agadir": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Meknes": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Oujda": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Kenitra": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
  "Tetouan": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80",
};

interface CityCardProps {
  city: City;
  index?: number;
  size?: "sm" | "md" | "lg";
}

export function CityCard({ city, index = 0, size = "md" }: CityCardProps) {
  const sizeClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  };

  const imageUrl = city.imageUrl || defaultCityImages[city.name] || "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/search/${city.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative overflow-hidden rounded-2xl cursor-pointer group",
            sizeClasses[size]
          )}
        >
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={city.name}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              loader={cloudinaryLoader}
              className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-display font-semibold text-base md:text-lg text-white/90">{city.name}</h3>
            <p className="flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5" />
              {formatNumber(city.business_count)} businesses
            </p>
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-primary-500/20 transition-opacity"
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

interface CityGridProps {
  className?: string;
  limit?: number;
}

export function CityGrid({ className, limit = 6 }: CityGridProps) {
  const { data: cities = [], isLoading } = useCities();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = !isMounted || isLoading;
  const displayCities = cities.slice(0, limit).map((city) => ({
    ...city,
    imageUrl: defaultCityImages[city.name],
  }));

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6", className)}>
      {showLoading
        ? [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-neutral-200 rounded-2xl animate-pulse" />
          ))
        : displayCities.map((city, index) => (
            <CityCard key={city.slug} city={city} index={index} />
          ))}
    </div>
  );
}

// Horizontal scrollable city list
export function CityList({ className }: { className?: string }) {
  const { data: cities = [], isLoading } = useCities();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = !isMounted || isLoading;

  return (
    <div className={cn("flex gap-4 overflow-x-auto scrollbar-hide pb-2", className)}>
      {showLoading
        ? [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 h-24 bg-neutral-200 rounded-2xl animate-pulse" />
          ))
        : cities.map((city, index) => {
        const imageUrl = defaultCityImages[city.name] || "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80";
        return (
          <Link
            key={city.slug}
            href={`/search/${city.slug}`}
            className="flex-shrink-0"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-40 h-24 rounded-2xl overflow-hidden group"
            >
              <Image
                src={imageUrl}
                alt={city.name}
                fill
                sizes="160px"
                loader={cloudinaryLoader}
                className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2 left-3 text-white">
                <p className="font-medium text-base text-white/90">{city.name}</p>
                <p className="text-xs text-white/70">{city.business_count}+</p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

export default CityCard;
