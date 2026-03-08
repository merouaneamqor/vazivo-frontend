"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Star, Sparkles } from "lucide-react";
import { ReviewFlow } from "@/components/reviews/ReviewFlow";
import { getBusinessPath, getBusinessCityDisplay } from "@/lib/utils";
import api from "@/lib/api";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [showReviewFlow, setShowReviewFlow] = useState(false);

  const { data } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => api.getBusiness(slug),
  });

  const business = data?.business;

  useEffect(() => {
    // Auto-open review flow after business loads
    if (business) {
      setShowReviewFlow(true);
    }
  }, [business]);

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Business Info */}
        <div className="bg-white  shadow-xl p-8 mb-6">
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-20 w-20 rounded-full mx-auto mb-4 object-cover border-2 border-neutral-100"
            />
          )}
          <h1 className="text-2xl font-bold mb-2">{business.name}</h1>
          <p className="text-neutral-600 mb-4">{getBusinessCityDisplay(business.city)}</p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{business.average_rating?.toFixed(1) || "New"}</span>
            <span className="text-neutral-500">({business.total_reviews || 0} reviews)</span>
          </div>

          <button
            onClick={() => setShowReviewFlow(true)}
            className="w-full bg-primary-600 text-white py-3  font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Leave a Review
          </button>
        </div>

        <p className="text-sm text-neutral-500">
          Your feedback helps others make better decisions
        </p>
      </div>

      {/* Review Flow Modal */}
      {showReviewFlow && business && (
        <ReviewFlow
          bookingId={0}
          businessId={business.id}
          businessName={business.name}
          isPremium={business.premium || false}
          onClose={() => {
            setShowReviewFlow(false);
            router.push(getBusinessPath({ ...business, slug }));
          }}
          onSuccess={() => {
            setShowReviewFlow(false);
            setTimeout(() => {
              window.location.href = `${getBusinessPath({ ...business, slug })}?reviewed=true`;
            }, 2000);
          }}
        />
      )}
    </div>
  );
}
