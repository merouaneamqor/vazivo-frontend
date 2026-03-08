"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Zap, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultCardProps {
  id: number;
  image: string;
  name: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  priceFrom: number;
  distance: number;
  instantBooking: boolean;
  promo: string | null;
}

export function ResultCard({
  id,
  image,
  name,
  rating,
  reviewCount,
  tags,
  priceFrom,
  distance,
  instantBooking,
  promo,
}: ResultCardProps) {
  return (
    <Link href={`/business/${id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-all duration-300 group">
        {/* Image Banner */}
        <div className="relative h-48 bg-neutral-100">
          <Image
            src={image || "/masscotte.png"}
            alt={name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {instantBooking && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                <Zap className="w-3 h-3 fill-current" />
                <span>Instant</span>
              </div>
            )}
            {promo && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                <Tag className="w-3 h-3" />
                <span>{promo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary transition">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{rating}</span>
            </div>
            <span className="text-sm text-neutral-500">({reviewCount} avis)</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price & Distance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">À partir de <span className="font-semibold text-neutral-900">{priceFrom} MAD</span></span>
            <div className="flex items-center gap-1 text-neutral-500">
              <MapPin className="w-3 h-3" />
              <span>{distance} km</span>
            </div>
          </div>

          {/* Book Button */}
          <Button className="w-full rounded-lg" size="lg">
            Réserver maintenant
          </Button>
        </div>
      </div>
    </Link>
  );
}
