"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, TrendingUp, Search, QrCode } from "lucide-react";
import { ProviderPremiumGate } from "@/components/provider/ProviderPremiumGate";
import { UpgradeModal } from "@/components/provider/UpgradeModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Review {
  id: number;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  comment: string;
  service_name: string;
  booking_date: string;
  created_at: string;
  response?: string;
  responded_at?: string;
  moderation_status: 'approved' | 'pending' | 'rejected';
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: { [key: number]: number };
  response_rate: number;
}

async function fetchReviews(filters: { rating?: number; search?: string }) {
  const params = new URLSearchParams();
  if (filters.rating) params.append("rating", filters.rating.toString());
  if (filters.search) params.append("q", filters.search);

  const response = await fetch(`/api/v1/provider/reviews?${params}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
}

async function respondToReview(reviewId: number, response: string) {
  const res = await fetch(`/api/v1/provider/reviews/${reviewId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ response }),
  });
  if (!res.ok) throw new Error("Failed to respond");
  return res.json();
}

export default function ProviderReviewsPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["provider-reviews", { rating: ratingFilter, search: searchQuery }],
    queryFn: () => fetchReviews({ rating: ratingFilter, search: searchQuery }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: number; response: string }) =>
      respondToReview(reviewId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-reviews"] });
      toast.success("Response posted successfully");
      setRespondingTo(null);
      setResponseText("");
    },
    onError: () => toast.error("Failed to post response"),
  });
  
  const moderateMutation = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: number; status: string }) => {
      const res = await fetch(`/api/v1/provider/reviews/${reviewId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to moderate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-reviews"] });
      toast.success("Review moderation updated");
    },
    onError: () => toast.error("Failed to moderate review"),
  });
  
  const handleModerate = (reviewId: number, status: string) => {
    moderateMutation.mutate({ reviewId, status });
  };

  const reviews: Review[] = data?.reviews || [];
  const stats: ReviewStats = data?.stats || {
    total_reviews: 0,
    average_rating: 0,
    rating_distribution: {},
    response_rate: 0,
  };

  return (
    <>
      <ProviderPremiumGate onUpgradeClick={() => setUpgradeOpen(true)}>
        <div className="min-h-screen bg-neutral-50">
          {/* Header */}
          <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Star className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-neutral-900">Reviews</h1>
                    <p className="text-sm text-neutral-500 mt-0.5">Manage customer feedback and ratings</p>
                  </div>
                </div>
                <a
                  href="/provider/reviews/qr-code"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <QrCode className="h-4 w-4" />
                  Generate QR Code
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
                  <Star className="h-4 w-4" />
                  Average Rating
                </div>
                <div className="text-2xl font-bold text-neutral-900">
                  {stats.average_rating.toFixed(1)}
                  <span className="text-sm text-neutral-500 font-normal ml-1">/ 5.0</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
                  <MessageSquare className="h-4 w-4" />
                  Total Reviews
                </div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total_reviews}</div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center gap-2 text-neutral-600 text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Response Rate
                </div>
                <div className="text-2xl font-bold text-neutral-900">{stats.response_rate}%</div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="text-neutral-600 text-sm mb-2">Rating Distribution</div>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{rating}</span>
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{
                            width: `${((stats.rating_distribution[rating] || 0) / stats.total_reviews) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-neutral-500">{stats.rating_distribution[rating] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRatingFilter(undefined)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      !ratingFilter
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                        ratingFilter === rating
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {rating}
                      <Star className="h-3 w-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-neutral-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-600 font-medium">No reviews yet</p>
                  <p className="text-sm text-neutral-500 mt-1">Reviews from customers will appear here</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={review.customer_avatar} />
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-semibold">
                          {getInitials(review.customer_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="font-semibold text-neutral-900">{review.customer_name}</div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                              <span>{review.service_name}</span>
                              <span>•</span>
                              <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-4 w-4", i < review.rating && "fill-current")} />
                            ))}
                          </div>
                        </div>

                        <p className="text-sm text-neutral-700 leading-relaxed">{review.comment}</p>
                        
                        {/* Moderation Status */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            review.moderation_status === 'approved' ? "bg-green-100 text-green-700" :
                            review.moderation_status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {review.moderation_status}
                          </span>
                          
                          {review.moderation_status !== 'approved' && (
                            <button
                              onClick={() => handleModerate(review.id, 'approved')}
                              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                          )}
                          
                          {review.moderation_status === 'approved' && (
                            <button
                              onClick={() => handleModerate(review.id, 'rejected')}
                              className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          )}
                        </div>

                        {review.response ? (
                          <div className="mt-4 pl-4 border-l-2 border-primary-200 bg-primary-50 p-3 rounded-r-lg">
                            <div className="text-xs font-semibold text-primary-700 mb-1">Your Response</div>
                            <p className="text-sm text-neutral-700">{review.response}</p>
                            <div className="text-xs text-neutral-500 mt-1">
                              {new Date(review.responded_at!).toLocaleDateString()}
                            </div>
                          </div>
                        ) : respondingTo === review.id ? (
                          <div className="mt-4 space-y-2">
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Write your response..."
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  respondMutation.mutate({ reviewId: review.id, response: responseText })
                                }
                                disabled={!responseText.trim() || respondMutation.isPending}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {respondMutation.isPending ? "Posting..." : "Post Response"}
                              </button>
                              <button
                                onClick={() => {
                                  setRespondingTo(null);
                                  setResponseText("");
                                }}
                                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(review.id)}
                            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ProviderPremiumGate>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
