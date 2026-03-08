"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Star,
  Trash2,
  Grid3X3,
  List,
  Search,
  ArrowRight,
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CompactRating } from "@/components/ui/rating-stars";
import { CategoryBadge } from "@/components/ui/badge";
import { ActionSheet } from "@/components/ui/bottom-sheet";
import { SwipeActionRow } from "@/components/ui/swipe-action";
import { cn, getBusinessPath } from "@/lib/utils";

type ViewMode = "grid" | "list";

export default function FavoritesPage() {
  const { favorites, isLoaded, removeFavorite, clearFavorites, count } = useFavorites();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="h-12 w-12 text-neutral-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                Saved Places
              </h1>
              <p className="text-sm text-neutral-500">
                {count} {count === 1 ? "place" : "places"} saved
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-neutral-100  p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "list"
                      ? "bg-white shadow-sm text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
              {count > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-neutral-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-rose-300" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No saved places yet
                </h3>
                <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                  Start exploring and save your favorite salons, spas, and wellness centers for quick access.
                </p>
                <Link href="/search">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Explore Places
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === "list" ? (
              <div className="space-y-3">
                {favorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <SwipeActionRow
                      rightActions={[
                        {
                          icon: <Trash2 className="h-5 w-5" />,
                          label: "Remove",
                          color: "text-white",
                          bgColor: "bg-red-500",
                          onAction: () => removeFavorite(favorite.id),
                        },
                      ]}
                    >
                      <Link href={getBusinessPath({ slug: favorite.slug, city: favorite.city, category: favorite.category })}>
                        <div className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 transition-colors">
                          <div className="relative w-20 h-20  overflow-hidden flex-shrink-0 bg-neutral-100">
                            {favorite.image_url ? (
                              <Image
                                src={favorite.image_url}
                                alt={favorite.name}
                                fill
                                className="object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Heart className="h-8 w-8 text-neutral-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-neutral-900 line-clamp-1">
                                  {favorite.name}
                                </h3>
                                <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {favorite.city}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFavorite(favorite.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                              >
                                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <CategoryBadge category={favorite.category} className="text-xs" />
                              <CompactRating
                                rating={favorite.average_rating}
                                count={favorite.total_reviews}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </SwipeActionRow>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {favorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Link href={getBusinessPath({ slug: favorite.slug, city: favorite.city, category: favorite.category })}>
                      <Card className="overflow-hidden group">
                        <div className="relative aspect-square">
                          {favorite.image_url ? (
                            <Image
                              src={favorite.image_url}
                              alt={favorite.name}
                              fill
                              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                              <Heart className="h-12 w-12 text-neutral-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeFavorite(favorite.id);
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                          >
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="font-semibold text-white text-sm line-clamp-1">
                              {favorite.name}
                            </h3>
                            <p className="text-white/80 text-xs flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {favorite.average_rating > 0
                                ? favorite.average_rating.toFixed(1)
                                : "New"}{" "}
                              <span className="text-white/60">
                                · {favorite.city}
                              </span>
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link href="/search">
              <Button variant="outline" className="w-full">
                Discover More Places
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Clear Confirmation */}
      <ActionSheet
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear all saved places?"
        actions={[
          {
            label: "Clear All",
            icon: <Trash2 className="h-5 w-5" />,
            variant: "destructive",
            onClick: clearFavorites,
          },
        ]}
        cancelLabel="Keep Saved"
      />
    </div>
  );
}
