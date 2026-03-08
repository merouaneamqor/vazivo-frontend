/** Admin sub-role for users with role "admin" */
export type AdminRole =
  | "superadmin"
  | "support"
  | "moderator"
  | "finance"
  | "technical_admin";

/** Provider account status - separate from business verification and payment. */
export type ProviderStatus = "confirmed" | "not_confirmed";

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: "customer" | "provider" | "admin";
  admin_role?: AdminRole;
  /** Provider account confirmation status. Only present when role is provider. */
  provider_status?: ProviderStatus;
  /** Whether the provider has at least one premium business. Only present for providers. */
  premium?: boolean;
  /** Deprecated: premium is per-business; use subscription API for expiry. */
  premium_expires_at?: string | null;
  avatar_url?: string;
  /** Preferred UI locale (e.g. en, fr, ar). Used for app localization. */
  locale?: string;
  created_at: string;
}

export interface Business {
  id: number;
  slug: string;
  name: string;
  description?: string;
  category: string;
  categories?: string[];
  /** Restaurant: cuisine tags (e.g. ["Moroccan", "Mediterranean"]). */
  cuisine_types?: string[];
  /** Restaurant: price range e.g. "$", "$$", "$$$". */
  price_range?: string | null;
  /** Restaurant: total tables or max guests per slot. */
  table_capacity?: number | null;
  address: string;
  city: string;
  country?: string | null;
  neighborhood?: string | null;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  /** API may return legacy (one interval per day) or array of intervals per day. */
  opening_hours: OpeningHours | OpeningHoursMulti;
  average_rating: number;
  total_reviews: number;
  rating_breakdown?: ReviewBreakdown;
  category_averages?: ReviewCategoryAverages;
  min_price?: number;
  max_price?: number;
  /** Single brand/cover image URL (from Active Storage logo or first image). */
  logo_url?: string | null;
  /** Gallery image URLs (from Active Storage images). */
  image_urls?: string[];
  is_open?: boolean;
  today_hours?: { open: string; close: string } | null;
  created_at: string;
  updated_at?: string;
  user?: User;
  services?: Service[];
  reviews?: Review[];
  /** Public display for Collaborators section (id, name, avatar_url) */
  staff?: { id: number; name: string; avatar_url?: string }[];
  /** Business is premium (booking, services, reviews shown only when true). */
  premium?: boolean;
}

/** Legacy: one interval per day. */
export interface OpeningHours {
  [day: string]: {
    open: string | null;
    close: string | null;
  };
}

/** One time interval (open/close). */
export interface OpeningHoursInterval {
  open: string;
  close: string;
}

/** All intervals for a single day (supports split shifts). */
export type OpeningHoursDay = OpeningHoursInterval[];

/** Multi-interval opening hours: array per day. */
export type OpeningHoursMulti = Record<string, OpeningHoursDay>;

/** API/backend can return legacy or array format. */
export type OpeningHoursPayload = OpeningHours | OpeningHoursMulti;

export interface Service {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  category_id?: number;
  category_name?: string;
  parent_category_name?: string;
  parent_category_slug?: string;
  formatted_duration: string;
  formatted_price: string;
  business_id: number;
  business_name: string;
  business_slug?: string;
  image_url?: string;
  service_category_id?: number;
  service_category?: {
    id: number;
    name: string;
    color: string;
  };
  created_at: string;
  updated_at?: string;
  business?: Business;
  is_available?: boolean;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  position: number;
  archived: boolean;
  services_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoryInput {
  name: string;
  description?: string;
  color?: string;
  position?: number;
}

export interface CategoryAct {
  id: number;
  name: string;
  slug: string;
  position: number;
  subacts: CategorySubact[];
}

export interface CategorySubact {
  id: number;
  name: string;
  slug: string;
  position: number;
}

interface TimeSlot {
  time: string;
  end_time: string;
  available: boolean;
  duration: number;
}

interface AvailabilityDay {
  date: string;
  day_name: string;
  is_open: boolean;
  slots: TimeSlot[];
}

export interface Booking {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  total_price?: number;
  notes?: string;
  /** Alias for notes in reservation context. */
  special_requests?: string;
  /** Restaurant: party size (number of guests). */
  number_of_guests?: number | null;
  duration_minutes: number;
  can_cancel: boolean;
  can_confirm: boolean;
  can_complete: boolean;
  service_id: number;
  service_name: string;
  business_id: number;
  business_name: string;
  business_slug?: string;
  short_booking_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  staff_id?: number;
  staff?: {
    id: number;
    name: string;
    email: string;
  };
  booking_services?: Array<{
    id: number;
    service_id: number;
    service_name: string;
    staff_id?: number;
    staff_name?: string;
    price: number;
    duration_minutes: number;
    position: number;
  }>;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
  service?: Service;
  business?: Business;
  user?: User;
  review?: Review;
}

export interface StaffMember {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: "owner" | "manager" | "staff";
  active: boolean;
  avatar_url?: string;
}

/** Business-scoped client (separate from User). */
export interface Client {
  id: number;
  name: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  user_id?: number;
  created_at?: string;
}

export interface StaffAvailability {
  id: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  available: boolean;
  user_id: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end_time: string;
  status: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service_id: number;
  service_name: string;
  service_duration: number;
  service_price: number;
  staff_id?: number;
  staff_name?: string;
  notes?: string;
  total_price: number;
  created_at: string;
}

/** Public confirmation payload (no auth required) */
export interface BookingConfirmation {
  short_booking_id: string;
  service_name: string;
  business_name: string;
  business_slug: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number | null;
  duration_minutes: number;
  customer_name: string | null;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  user_name: string;
  user_id: number;
  booking_id: number;
  business_id: number;
  created_at: string;
  edited_at?: string;
  
  // Multi-criteria ratings
  cleanliness_rating: number;
  punctuality_rating: number;
  professionalism_rating: number;
  service_quality_rating: number;
  hygiene_rating: number;
  
  // Premium categories (optional)
  ambiance_rating?: number;
  staff_friendliness_rating?: number;
  waiting_time_rating?: number;
  value_rating?: number;
  
  // Photos
  photos: string[];
  
  // Moderation
  moderation_status: 'approved' | 'pending' | 'rejected';
  
  user?: {
    id: number;
    name: string;
    initials?: string;
    avatar_url?: string;
  };
  service_name?: string;
}

export interface ReviewCategoryAverages {
  cleanliness: number;
  punctuality: number;
  professionalism: number;
  service_quality: number;
  hygiene: number;
  ambiance?: number;
  staff_friendliness?: number;
  waiting_time?: number;
  value?: number;
}

export interface ReviewBreakdown {
  1: { count: number; percentage: number };
  2: { count: number; percentage: number };
  3: { count: number; percentage: number };
  4: { count: number; percentage: number };
  5: { count: number; percentage: number };
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: ReviewBreakdown;
  category_averages: ReviewCategoryAverages;
  recent_photos: string[];
}

interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "refunded";
  stripe_payment_intent_id?: string;
  paid_at?: string;
}

export interface PaginatedResponse {
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

interface ApiError {
  error?: string;
  errors?: string[];
}

// Dashboard stats
interface DashboardStats {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
}
