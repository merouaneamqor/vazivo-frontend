"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewSummary } from "@/types";
import { useTranslations } from "next-intl";

interface ReviewBreakdownProps {
  summary: ReviewSummary;
  isPremium: boolean;
}

export function ReviewBreakdown({ summary, isPremium }: ReviewBreakdownProps) {
  const t = useTranslations("reviews");
  const { average_rating, total_reviews, rating_breakdown, category_averages } = summary;

  const CATEGORY_LABELS: Record<string, { emoji: string }> = {
    cleanliness: { emoji: "✨" },
    professionalism: { emoji: "👔" },
    punctuality: { emoji: "⏰" },
    service_quality: { emoji: "⭐" },
    hygiene: { emoji: "🧼" },
    ambiance: { emoji: "🎵" },
    staff_friendliness: { emoji: "😊" },
    waiting_time: { emoji: "⏱️" },
    value: { emoji: "💰" },
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex items-center gap-4 md:p-6">
        <div className="text-center">
          <div className="text-5xl font-bold">{average_rating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= Math.round(average_rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-neutral-300"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-500 mt-1">{total_reviews} {t("reviewsCount", { count: total_reviews })}</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const data = rating_breakdown[rating as keyof typeof rating_breakdown];
            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-neutral-600">{rating}★</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${data?.percentage || 0}%` }}
                  />
                </div>
                <span className="w-12 text-right text-neutral-500">{data?.count || 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Scores */}
      <div>
        <h3 className="font-semibold mb-3">{t("ratingByCategory")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(category_averages).map(([key, value]) => {
            const config = CATEGORY_LABELS[key];
            if (!config) return null;
            if (!isPremium && ["ambiance", "staff_friendliness", "waiting_time", "value"].includes(key)) {
              return null;
            }

            return (
              <div key={key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.emoji}</span>
                  <span className="text-sm font-medium">{t(key as any)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{value.toFixed(1)}</span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
