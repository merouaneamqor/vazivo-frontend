"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/ui/rating-stars";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  city: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  priceRange?: string;
  slug?: string;
  className?: string;
}

export function RestaurantCard(props: RestaurantCardProps) {
  const {
    name,
    cuisine,
    city,
    rating,
    reviewCount,
    imageUrl,
    priceRange,
    slug = "#",
    className,
  } = props;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={cn("group", className)}
    >
      <Link href={slug} className="block">
        <div className="rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-vazivo transition-all duration-300 group-hover:shadow-vazivo-hover group-hover:border-vazivo-orangeSoft">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-sm font-medium text-vazivo-warmGray shadow-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
            {priceRange && (
              <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-sm font-medium text-white">
                {priceRange}
              </div>
            )}
          </div>
          <div className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-lg text-vazivo-warmGray group-hover:text-vazivo-red transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-vazivo-warmMuted mt-0.5">{cuisine}</p>
            <div className="flex items-center gap-1.5 mt-2 text-neutral-500 text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{city}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <RatingStars
                rating={rating}
                size="sm"
                showValue
                showCount
                count={reviewCount}
              />
              <span className="inline-flex items-center justify-center rounded-xl bg-vazivo-red px-4 py-2 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                Book table
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
