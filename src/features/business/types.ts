/**
 * Business Feature — Type Definitions
 * @module src/features/business/types
 */

export type BusinessStatus = "active" | "inactive" | "pending" | "suspended";

export interface BusinessService {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
}

export interface Business {
  id: number;
  slug: string;
  name: string;
  description?: string;
  category: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  coverImageUrl?: string;
  images: string[];
  services: BusinessService[];
  rating: number;
  reviewCount: number;
  status: BusinessStatus;
  isPremium: boolean;
  isVerified: boolean;
  providerId: number;
}

export interface BusinessFormValues {
  name: string;
  description: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}
