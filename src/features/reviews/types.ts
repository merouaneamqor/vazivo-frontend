/**
 * Reviews Feature — Type Definitions
 * @module src/features/reviews/types
 */

export interface Review {
  id: number;
  bookingId?: number;
  businessId: number;
  businessName: string;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number;         // 1–5
  title?: string;
  body: string;
  reply?: string;
  replyAt?: string;
  createdAt: string;
  isVerified: boolean;    // linked to a real booking
}

export interface ReviewBreakdownData {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CreateReviewPayload {
  bookingId?: number;
  businessId: number;
  rating: number;
  title?: string;
  body: string;
}
