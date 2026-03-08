"use client";

import { Star, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import type { Review } from "@/types";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface ReviewCardProps {
  review: Review;
  showPhotos?: boolean;
}

export function ReviewCard({ review, showPhotos = true }: ReviewCardProps) {
  const t = useTranslations("reviews");
  const hasPhotos = review.photos && review.photos.length > 0;

  return (
    <article className="border-b border-neutral-100 py-6 last:border-0">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10">
          {review.user?.avatar_url && <AvatarImage src={review.user.avatar_url} />}
          <AvatarFallback>{getInitials(review.user_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{review.user_name || t("anonymous")}</h4>
            {review.edited_at && (
              <span className="text-xs text-neutral-400">({t("edited")})</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-500">
              {format(new Date(review.created_at), "MMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-neutral-700 leading-relaxed mb-3">
          {review.comment}
        </p>
      )}

      {/* Photos */}
      {showPhotos && hasPhotos && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {review.photos.slice(0, 5).map((photo, idx) => (
            <div
              key={idx}
              className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100"
            >
              <img
                src={photo}
                alt={`Review photo ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Category Ratings (collapsed by default) */}
      <details className="mt-3">
        <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
          {t("viewDetailedRatings")}
        </summary>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {[
            { key: "service_quality", label: t("serviceQuality"), emoji: "⭐" },
            { key: "cleanliness", label: t("cleanliness"), emoji: "✨" },
            { key: "professionalism", label: t("professionalism"), emoji: "👔" },
            { key: "punctuality", label: t("punctuality"), emoji: "⏰" },
            { key: "hygiene", label: t("hygiene"), emoji: "🧼" },
          ].map(({ key, label, emoji }) => {
            const value = review[`${key}_rating` as keyof Review] as number;
            if (!value) return null;
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <span>{emoji}</span>
                <span className="text-neutral-600">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            );
          })}
        </div>
      </details>
    </article>
  );
}
