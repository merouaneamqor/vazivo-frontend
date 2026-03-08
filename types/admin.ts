// Admin panel types

export type AdminRole =
  | "superadmin"
  | "support"
  | "moderator"
  | "finance"
  | "technical_admin";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  admin_role?: AdminRole;
  avatar_url?: string;
  created_at: string;
}

export interface AdminDashboardKpis {
  bookings_today: number;
  bookings_yesterday: number;
  revenue_today: number;
  revenue_yesterday: number;
  active_providers: number;
  pending_provider_approvals: number;
  new_customers_week: number;
  new_customers_last_week: number;
  total_bookings_month: number;
  total_revenue_month: number;
  premium_providers: number;
  verified_providers: number;
  active_subscriptions: number;
  subscriptions_by_plan: Record<string, number>;
  mrr: number;
  new_subscriptions_month: number;
}

export interface AdminDashboardCharts {
  bookings_by_day: Record<string, number>;
  revenue_by_day: Record<string, number>;
  reviews_by_day?: Record<string, number>;
  new_customers_by_day?: Record<string, number>;
  bookings_by_status?: Record<string, number>;
  rating_distribution?: Record<string, number>;
  top_cities: { name: string; value: number }[];
  top_categories: { name: string; value: number }[];
}

export interface AdminActivityItem {
  id: number;
  type: "booking" | "review";
  customer_name?: string;
  user_name?: string;
  business_name: string;
  service_name?: string;
  date?: string;
  status?: string;
  rating?: number;
  created_at: string;
}

export interface AdminActivityLogEntry {
  id: number;
  admin_user_id: number;
  admin_user_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface AdminActivityLogResponse {
  logs: AdminActivityLogEntry[];
  meta: PaginatedMeta;
}

export interface AdminDashboard {
  kpis: AdminDashboardKpis;
  charts: AdminDashboardCharts;
  recent_activity: {
    bookings: AdminActivityItem[];
    reviews: AdminActivityItem[];
  };
}

export interface AdminCustomerListItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "active" | "suspended";
  total_bookings: number;
  total_reviews: number;
  last_login_at?: string;
  created_at: string;
}

export type VerificationStatus = "verified" | "pending";
export type AccountStatus = "active" | "suspended" | "unverified";

export interface AdminProviderListItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  city: string;
  address?: string;
  status: "approved" | "suspended";
  verification_status: VerificationStatus;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_user_id: number;
  owner_provider_status?: "confirmed" | "not_confirmed";
  owner_premium_expires_at?: string | null;
  owner_subscriptions_count?: number;
  last_login_at?: string;
  account_status: AccountStatus;
  average_rating: number;
  total_reviews: number;
  total_services: number;
  total_bookings: number;
  total_bookings_30d: number;
  no_show_rate: number;
  cancellation_rate: number;
  last_booking_at?: string;
  first_booking_at?: string;
  onboarding_score: number;
  has_services: boolean;
  has_cover_photos: boolean;
  has_opening_hours: boolean;
  has_staff: boolean;
  has_availability: boolean;
  has_category: boolean;
  has_geo: boolean;
  staff_count: number;
  staff_with_availability_count: number;
  map_link?: string;
  geo_validated?: boolean;
  suspicious_rating_pattern?: boolean;
  high_no_show?: boolean;
  high_refund_rate?: boolean;
  duplicate_listing?: boolean;
  banned_user_linked?: boolean;
  missing_documents?: boolean;
  user_id: number;
  created_at: string;
}

/** Admin provider detail for edit page: list item + editable business fields from API. */
export type AdminProviderDetail = AdminProviderListItem & {
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  opening_hours?: Record<string, Array<{ open: string; close: string }>> | null;
  neighborhood?: string | null;
  country?: string | null;
  category_ids?: number[];
  categories?: string[];
  owner?: { name?: string; email?: string; id?: number } | null;
  services?: { id: number; name: string; price: number; duration: number }[] | null;
};

export interface AdminPlan {
  id: number;
  name: string;
  identifier: string;
  duration_months: number;
  suggested_price: number | null;
  currency: string;
  active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProvidersFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  status?: string;
  verification_status?: string;
  onboarding?: "all" | "complete" | "incomplete";
  onboarding_min?: number;
  min_rating?: number;
  max_rating?: number;
  no_show_threshold?: number;
  created_after?: string;
  created_before?: string;
  last_booking_after?: string;
  last_booking_before?: string;
  premium_status?: "active" | "expired" | "never";
  published?: "yes" | "no";
  geo_validated?: "yes" | "no";
  has_services?: "yes" | "no";
  has_bookings?: "yes" | "no";
  neighborhood?: string;
  order?: "created_at" | "name" | "rating" | "last_booking_at";
  page?: number;
  per_page?: number;
}

export interface AdminBookingListItem {
  id: number;
  user_id: number;
  customer_name?: string;
  business_id: number;
  business_name?: string;
  service_id: number;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price?: number;
  payment_status?: string;
  created_at: string;
}

export interface AdminReviewListItem {
  id: number;
  user_id: number;
  user_name?: string;
  business_id: number;
  business_name?: string;
  booking_id: number;
  rating: number;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_notes?: string;
  created_at: string;
  edited_at?: string;
  hidden_at?: string;
  flagged_at?: string;
  flag_reason?: string;
  cleanliness_rating: number;
  punctuality_rating: number;
  professionalism_rating: number;
  service_quality_rating: number;
  hygiene_rating: number;
  ambiance_rating?: number;
  staff_friendliness_rating?: number;
  waiting_time_rating?: number;
  value_rating?: number;
  photos?: string[];
}

export type ClaimRequestStatus = "pending" | "approved" | "rejected";

export interface AdminClaimRequestListItem {
  id: number;
  business_id: number;
  business_name?: string;
  business_slug?: string;
  user_id: number | null;
  user_name?: string | null;
  email: string;
  name: string;
  status: ClaimRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

// ========== Categories (Acts & Subacts) ==========

export interface AdminSubact {
  id: number;
  name: string;
  name_en?: string | null;
  name_fr?: string | null;
  name_ar?: string | null;
  slug: string;
  slug_en?: string | null;
  slug_fr?: string | null;
  slug_ar?: string | null;
  translated_name?: string;
  position: number;
  parent_id: number;
}

export interface AdminAct {
  id: number;
  name: string;
  name_en?: string | null;
  name_fr?: string | null;
  name_ar?: string | null;
  slug: string;
  slug_en?: string | null;
  slug_fr?: string | null;
  slug_ar?: string | null;
  translated_name?: string;
  position: number;
  parent_id?: number;
  subacts: AdminSubact[];
}

export interface AdminCategory {
  id: number;
  name: string;
  name_en?: string | null;
  name_fr?: string | null;
  name_ar?: string | null;
  slug: string;
  slug_en?: string | null;
  slug_fr?: string | null;
  slug_ar?: string | null;
  translated_name?: string;
  position: number;
  parent_id: number | null;
}

// ========== Cities & Neighborhoods ==========

export interface AdminNeighborhood {
  id: number;
  name: string;
  slug: string;
  position: number;
  city_id: number;
}

export interface AdminCity {
  id: number;
  name: string;
  slug: string;
  position: number;
  neighborhoods: AdminNeighborhood[];
}

export interface AdminSeoPage {
  id: number;
  path: string;
  title?: string | null;
  meta_description?: string | null;
  seo_text?: string | null;
  city?: string | null;
  service?: string | null;
  business_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}
