"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, BadgeCheck, Flame, Sparkles, Clock } from "lucide-react";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CategoryBadge } from "@/components/ui/badge";
import CompactAvailability, {
    CompactAvailabilitySkeleton,
} from "@/components/search/CompactAvailability";
import { cn, formatPrice, getBusinessPath, getBusinessCityDisplay, getBusinessCategoryDisplay } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Business } from "@/types";

/* ──────────────────────────── helpers ──────────────────────────── */

function getPriceIndicator(min?: number, max?: number): string | null {
    if (!min && !max) return null;
    const avg = ((min || 0) + (max || min || 0)) / 2;
    if (avg <= 20) return "M";
    if (avg <= 50) return "MM";
    return "MMM";
}

function isNewBusiness(createdAt: string): boolean {
    const created = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
}

/* ──────────────────────────── trust badges ──────────────────────── */

interface TrustBadge {
    key: string;
    label: string;
    icon: React.ReactNode;
    className: string;
}

function getTrustBadges(business: Business): TrustBadge[] {
    const badges: TrustBadge[] = [];

    // Verified (placeholder — always show for now)
    badges.push({
        key: "verified",
        label: "Verified",
        icon: <BadgeCheck className="h-3 w-3" />,
        className: "bg-vazivo-red/10 text-vazivo-red border-vazivo-red/20",
    });

    if (business.average_rating >= 4.8 && business.total_reviews >= 3) {
        badges.push({
            key: "high-rating",
            label: "Top Rated",
            icon: <Star className="h-3 w-3 fill-current" />,
            className: "bg-amber-50 text-amber-700 border-amber-200",
        });
    }

    if (business.total_reviews >= 20) {
        badges.push({
            key: "popular",
            label: "Popular",
            icon: <Flame className="h-3 w-3" />,
            className: "bg-rose-50 text-rose-700 border-rose-200",
        });
    }

    if (isNewBusiness(business.created_at)) {
        badges.push({
            key: "new",
            label: "New",
            icon: <Sparkles className="h-3 w-3" />,
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        });
    }

    return badges;
}

/* ──────────────────────────── skeleton ─────────────────────────── */

export function ProviderCardSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row bg-vazivo-white rounded-2xl border border-vazivo-lightGray shadow-sm overflow-hidden">
            {/* Image */}
            <div className="relative sm:w-[240px] flex-shrink-0">
                <Skeleton className="w-full aspect-[4/3] sm:h-full rounded-none" />
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-3.5 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                    <Skeleton className="h-3.5 w-32" />
                </div>
                {/* Badges */}
                <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                {/* Services */}
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3.5 w-36" />
                </div>
                {/* Availability pills */}
                <div className="flex gap-2 pt-1">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────── card ─────────────────────────────── */

interface ProviderCardProps {
    business: Business;
    index?: number;
    onSlotSelect?: (business: Business, date: string, time: string) => void;
    hoveredId?: number | null;
    onHover?: (id: number | null) => void;
}

export default function ProviderCard({
    business,
    index = 0,
    onSlotSelect,
    hoveredId,
    onHover,
}: ProviderCardProps) {
    if (!business?.id || !business?.name) return null;

    const defaultPlaceholderImage = "/masscotte.png";
    const imageUrl = business.logo_url || business.image_urls?.[0] || defaultPlaceholderImage;
    const priceIndicator = getPriceIndicator(business.min_price, business.max_price);
    const trustBadges = getTrustBadges(business);
    const isHovered = hoveredId === business.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onMouseEnter={() => onHover?.(business.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            <div
                className={cn(
                    "bg-white  border shadow-sm overflow-hidden transition-all duration-200 group rounded-xl",
                    isHovered
                        ? "border-vazivo-red/50 shadow-md ring-1 ring-vazivo-red/30"
                        : "border-vazivo-lightGray hover:border-vazivo-red/40 hover:shadow-md"
                )}
            >
                <Link
                    href={getBusinessPath(business)}
                    className="flex flex-col sm:flex-row"
                >
                    {/* ─── Image ─── */}
                    <div className="relative sm:w-[240px] flex-shrink-0 overflow-hidden">
                        <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-full">
                            <Image
                                src={imageUrl}
                                alt={business.name}
                                fill
                                sizes="(min-width: 640px) 240px, 100vw"
                                loader={imageUrl === defaultPlaceholderImage ? undefined : cloudinaryLoader}
                                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        {/* Overlay badges */}
                        <div className="absolute top-3 left-3">
                            <CategoryBadge category={getBusinessCategoryDisplay(business.category)} />
                        </div>
                        <FavoriteButton
                            business={business}
                            variant="overlay"
                            size="sm"
                            className="top-3 right-3"
                        />
                        {/* Price indicator */}
                        {priceIndicator && (
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                                {priceIndicator}
                            </div>
                        )}
                    </div>

                    {/* ─── Content ─── */}
                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-2.5">
                        {/* Header row: name + rating */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="font-display font-semibold text-base text-vazivo-charcoal truncate group-hover:text-vazivo-red transition-colors">
                                    {business.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-vazivo-warmMuted">{getBusinessCategoryDisplay(business.category)}</span>
                                    {priceIndicator && (
                                        <span className="text-xs text-vazivo-warmMuted">·</span>
                                    )}
                                    {priceIndicator && (
                                        <span className="text-xs font-medium text-vazivo-charcoal">{priceIndicator}</span>
                                    )}
                                </div>
                            </div>
                            {/* Rating */}
                            {business.average_rating > 0 && (
                                <div className="flex items-center gap-1 bg-vazivo-red/10 px-2 py-1 rounded-lg flex-shrink-0">
                                    <Star className="h-3.5 w-3.5 text-vazivo-red fill-vazivo-red" />
                                    <span className="text-sm font-semibold text-vazivo-red">
                                        {business.average_rating.toFixed(1)}
                                    </span>
                                    {business.total_reviews > 0 && (
                                        <span className="text-[10px] text-vazivo-red/80">
                                            ({business.total_reviews})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-1.5 text-vazivo-warmMuted">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="text-xs truncate">
                                {business.address ? `${business.address}, ${getBusinessCityDisplay(business.city)}` : getBusinessCityDisplay(business.city)}
                            </span>
                        </div>

                        {/* Trust badges */}
                        {trustBadges.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {trustBadges.map((b) => (
                                    <span
                                        key={b.key}
                                        className={cn(
                                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                            b.className
                                        )}
                                    >
                                        {b.icon}
                                        {b.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Services preview */}
                        {business.services && business.services.length > 0 && (
                            <div className="flex flex-col gap-0.5">
                                {business.services.slice(0, 2).map((svc) => (
                                    <div
                                        key={svc.id}
                                        className="flex items-center justify-between text-xs"
                                    >
<span className="text-neutral-600 truncate mr-2">
                                        {svc.name}
                                    </span>
                                        <span className="font-medium text-vazivo-charcoal flex-shrink-0">
                                            {svc.formatted_price}
                                        </span>
                                    </div>
                                ))}
                                {business.services.length > 2 && (
<span className="text-[10px] text-vazivo-red font-medium">
                                            +{business.services.length - 2} more services
                                        </span>
                                )}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Compact availability — premium only (outside link to avoid nested <a>) */}
                {business.premium === true && (
                <div className="flex-1 min-w-0 p-4 sm:p-5 pt-1 border-t border-vazivo-lightGray">
                    <CompactAvailability
                        business={business}
                        maxSlots={12}
                        onSlotSelect={onSlotSelect}
                    />
                </div>
                )}
            </div>
        </motion.div>
    );
}
