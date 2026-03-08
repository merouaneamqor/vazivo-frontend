"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, ScissorsLineDashed, HandHeart, LucideIcon, Heart, Sparkle } from "lucide-react";
import { cn, getSearchPath } from "@/lib/utils";
import { useCategories } from "@/hooks/useSearchMetadata";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  imageUrl?: string;
}

// Map category names to icons, gradients, and images (only these 5 categories)
const categoryConfig: Record<string, { icon: LucideIcon; gradient: string; description: string; imageUrl: string }> = {
  Barber: {
    icon: ScissorsLineDashed,
    gradient: "from-teal-500 to-teal-700",
    description: "Professional services",
    imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=600&fit=crop",
  },
  Hammam: {
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-600",
    description: "Professional services",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
  },
  Fitness: {
    icon: Sparkle,
    gradient: "from-blue-500 to-indigo-600",
    description: "Fitness and training",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
  },
  Spa: {
    icon: Heart,
    gradient: "from-violet-500 to-purple-600",
    description: "Professional services",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
  },
  Salon: {
    icon: HandHeart,
    gradient: "from-rose-500 to-pink-600",
    description: "Professional services",
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
  },
};

// Default config for unknown categories
const defaultConfig = {
  icon: Sparkles,
  gradient: "from-neutral-400 to-neutral-600",
  description: "Professional services",
  imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
};

function getCategoryConfig(name: string) {
  return categoryConfig[name] || defaultConfig;
}

interface CategoryGridProps {
  className?: string;
}

export function CategoryGrid({ className }: CategoryGridProps) {
  const { data: categories = [], isLoading } = useCategories();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = !isMounted || isLoading;

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6", className)}>
      {showLoading
        ? [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-neutral-200 rounded-2xl animate-pulse" />
          ))
        : categories.map((category, index) => {
        const config = getCategoryConfig(category.name);
        return (
          <CategoryCard
            key={category.slug}
            name={category.name}
            slug={category.slug}
            description={config.description}
            icon={config.icon}
            gradient={config.gradient}
            imageUrl={config.imageUrl}
            index={index}
            priority={index === 0}
          />
        );
      })}
    </div>
  );
}

function CategoryCard({
  name,
  slug,
  description,
  icon: Icon,
  gradient,
  imageUrl,
  index = 0,
  priority = false,
}: CategoryCardProps & { index?: number; priority?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={getSearchPath(null, name)}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "category-card relative overflow-hidden rounded-2xl",
            "aspect-square flex flex-col items-center justify-center text-center",
            "group"
          )}
        >
          {/* Background Image */}
          {imageUrl && (
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                priority={priority}
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                loader={cloudinaryLoader}
              />
              {/* Gradient Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-90 transition-opacity",
                gradient
              )} />
            </div>
          )}
          
          {/* Content */}
          <div className="relative z-10 px-4 py-6 flex flex-col items-center justify-center h-full text-white">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-3"
            >
              <Icon className="h-8 w-8 md:h-10 md:w-10" />
            </motion.div>
            <h3 className="font-display font-semibold text-base md:text-lg mb-1 text-white/90">{name}</h3>
            <p className="text-sm text-white/90 mt-1 hidden md:block px-2">{description}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Compact horizontal category list for mobile
export function CategoryList({ className }: { className?: string }) {
  const { data: categories = [], isLoading } = useCategories();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = !isMounted || isLoading;

  return (
    <div className={cn("flex gap-3 overflow-x-auto scrollbar-hide pb-2", className)}>
      {showLoading
        ? [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-32 h-10 bg-neutral-200 rounded-full animate-pulse" />
          ))
        : categories.map((category) => {
        const config = getCategoryConfig(category.name);
        const Icon = config.icon;
        return (
          <Link
            key={category.slug}
            href={getSearchPath(null, category.name)}
            className="flex-shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r",
                config.gradient,
                "text-white text-sm font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

export default CategoryCard;
