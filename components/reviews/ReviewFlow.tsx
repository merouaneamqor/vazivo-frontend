"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Upload, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewFlowProps {
  bookingId: number;
  businessId: number;
  businessName: string;
  isPremium: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CORE_CATEGORIES = [
  { key: "cleanliness", label: "Cleanliness", emoji: "✨" },
  { key: "professionalism", label: "Professionalism", emoji: "👔" },
  { key: "punctuality", label: "Punctuality", emoji: "⏰" },
  { key: "service_quality", label: "Service Quality", emoji: "⭐" },
  { key: "hygiene", label: "Hygiene", emoji: "🧼" },
];

const PREMIUM_CATEGORIES = [
  { key: "ambiance", label: "Ambiance", emoji: "🎵" },
  { key: "staff_friendliness", label: "Staff Friendliness", emoji: "😊" },
  { key: "waiting_time", label: "Waiting Time", emoji: "⏱️" },
  { key: "value", label: "Value for Money", emoji: "💰" },
];

export function ReviewFlow({ bookingId, businessId, businessName, isPremium, onClose, onSuccess }: ReviewFlowProps) {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const categories = isPremium ? [...CORE_CATEGORIES, ...PREMIUM_CATEGORIES] : CORE_CATEGORIES;
  const allRated = categories.every((cat) => ratings[cat.key] > 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const endpoint = bookingId === 0 ? "/api/v1/public/reviews/public" : "/api/v1/reviews";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          review: {
            ...(bookingId !== 0 && { booking_id: bookingId }),
            business_id: businessId,
            cleanliness_rating: ratings.cleanliness,
            professionalism_rating: ratings.professionalism,
            punctuality_rating: ratings.punctuality,
            service_quality_rating: ratings.service_quality,
            hygiene_rating: ratings.hygiene,
            ambiance_rating: ratings.ambiance,
            staff_friendliness_rating: ratings.staff_friendliness,
            waiting_time_rating: ratings.waiting_time,
            value_rating: ratings.value,
            comment,
            photos,
          },
        }),
      });

      if (response.ok) {
        setStep(5);
        setTimeout(() => onSuccess(), 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full sm:max-w-2xl sm: max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Rate your experience</h2>
            <p className="text-sm text-neutral-500">{businessName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 border-b">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary-600" : "bg-neutral-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-lg font-medium mb-6">How would you rate these aspects?</h3>
                <div className="space-y-6">
                  {categories.map((cat) => (
                    <CategoryRating
                      key={cat.key}
                      label={cat.label}
                      emoji={cat.emoji}
                      value={ratings[cat.key] || 0}
                      onChange={(val: number) => setRatings({ ...ratings, [cat.key]: val })}
                    />
                  ))}
                </div>
                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={!allRated}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-lg font-medium mb-2">Tell us more</h3>
                <p className="text-sm text-neutral-500 mb-4">Share details about your experience</p>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you love? What could be improved?"
                  rows={6}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-neutral-400 mt-2">{comment.length}/2000</p>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-lg font-medium mb-2">Add photos (optional)</h3>
                <p className="text-sm text-neutral-500 mb-4">Share before/after photos</p>
                <PhotoUploader photos={photos} onChange={setPhotos} />
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-1" onClick={() => setStep(4)}>Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-lg font-medium mb-4">Review summary</h3>
                <div className="bg-neutral-50  p-4 space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {(Object.values(ratings).reduce((a, b) => a + b, 0) / categories.length).toFixed(1)} stars
                    </span>
                  </div>
                  {comment && <p className="text-sm text-neutral-600 line-clamp-3">{comment}</p>}
                  {photos.length > 0 && <p className="text-sm text-neutral-500">{photos.length} photos</p>}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                <p className="text-neutral-500">Your review has been submitted</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function CategoryRating({ label, emoji, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= value ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoUploader({ photos, onChange }: any) {
  return (
    <div className="border-2 border-dashed  p-8 text-center">
      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
      <p className="text-sm text-neutral-500">Click to upload photos (max 5)</p>
      <p className="text-xs text-neutral-400 mt-1">JPG, PNG up to 10MB each</p>
    </div>
  );
}
