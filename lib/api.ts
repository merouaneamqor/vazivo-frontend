import type {
  User,
  Business,
  Service,
  ServiceCategory,
  ServiceCategoryInput,
  Booking,
  BookingConfirmation,
  Review,
  PaginatedResponse,
  StaffMember,
  StaffAvailability,
  CalendarEvent,
  Client,
} from "@/types";
import type { ProviderSearchResults } from "@/types/provider-search";
import { getLocaleCookie, normalizeLocale } from "@/lib/locale";

// Always use full backend URL to ensure requests go to API
function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:3000/api/v1";
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

const API_URL = getApiBaseUrl();

/** Upload FormData with XHR to report upload progress (fetch does not support it). */
function formDataUpload(
  url: string,
  formData: FormData,
  options: { method: "PATCH" | "POST"; onProgress?: (percent: number) => void; locale?: string }
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, url);
    xhr.withCredentials = true;
    if (options.locale) {
      xhr.setRequestHeader("X-Locale", options.locale);
    }
    if (options.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        options.onProgress!(e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0);
      });
    }
    xhr.onload = () => {
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({ "Content-Type": xhr.getResponseHeader("Content-Type") || "application/json" }),
        })
      );
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: string[]) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    const locale =
      typeof document !== "undefined"
        ? normalizeLocale(getLocaleCookie() || "fr")
        : "fr";
    (headers as Record<string, string>)["X-Locale"] = locale;

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "An error occurred" }));
      throw new ApiError(
        response.status,
        error.error || error.errors?.join(", ") || "Request failed",
        error.errors
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ========== Auth ==========
  async register(data: { first_name?: string; last_name?: string; name?: string; email: string; password: string; role?: string }) {
    return this.request<{ user: User; access_token: string; expires_in: number }>("/public/auth/register", {
      method: "POST",
      body: JSON.stringify({ user: data }),
    });
  }

  async registerProvider(payload: {
    user: { first_name: string; last_name?: string; name?: string; email: string; phone?: string; password: string; password_confirmation: string };
    business: {
      name: string;
      description?: string;
      categories: string[];
      address: string;
      city: string;
      country?: string;
      neighborhood?: string;
      phone?: string;
      email?: string;
      website?: string;
    };
  }) {
    return this.request<{
      user: User;
      business: Business;
      access_token: string;
      expires_in: number;
    }>("/public/auth/register_provider", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async upgradeToProvider(business: {
    name: string;
    description?: string;
    categories: string[];
    address: string;
    city: string;
    country?: string;
    neighborhood?: string;
    phone?: string;
    email?: string;
    website?: string;
  }) {
    return this.request<{
      user: User;
      business: Business;
      access_token: string;
      expires_in: number;
    }>("/user/upgrade-to-provider", {
      method: "POST",
      body: JSON.stringify({ business }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; access_token: string; expires_in: number }>("/public/auth/login", {
      method: "POST",
      body: JSON.stringify({ user: { email, password } }),
    });
  }

  async logout() {
    return this.request<{ message: string }>("/public/auth/logout", {
      method: "DELETE",
    });
  }

  async refreshToken() {
    return this.request<{ access_token: string; expires_in: number }>("/public/auth/refresh", {
      method: "POST",
    });
  }

  async getMe() {
    return this.request<{ user: User }>("/public/auth/me");
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>("/public/auth/password", {
      method: "PATCH",
      body: JSON.stringify({
        user: { current_password: currentPassword, new_password: newPassword, new_password_confirmation: newPassword },
      }),
    });
  }

  async getProfile() {
    return this.request<{ user: User }>("/account/profile");
  }

  async updateProfile(data: { locale?: string }) {
    return this.request<{ user: User }>("/account/profile", {
      method: "PATCH",
      body: JSON.stringify({ user: data }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/public/auth/forgot_password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async validateResetToken(token: string, email: string) {
    return this.request<{ status: string; error?: string }>(`/public/auth/validate_reset_token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
      method: "GET",
    });
  }

  async resetPassword(token: string, email: string, password: string) {
    return this.request<{ status: string; message?: string; error?: string }>("/public/auth/reset_password", {
      method: "POST",
      body: JSON.stringify({ token, email, password }),
    });
  }

  // ========== Public Business API (No auth required) ==========
  async getBusinesses(params?: {
    q?: string;
    category?: string;
    cuisine?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    // Use search endpoint if location params are provided, otherwise use regular endpoint
    const endpoint = params?.lat != null && params?.lng != null 
      ? "/public/businesses/search"
      : "/public/businesses";
    
    const response = await this.request<{ businesses: Business[]; meta?: PaginatedResponse["meta"] }>(endpoint, {
      params: params as Record<string, string | number | undefined>,
    });
    
    // Ensure meta exists
    if (!response.meta && Array.isArray(response.businesses)) {
      return {
        ...response,
        meta: {
          current_page: 1,
          total_pages: 1,
          total_count: response.businesses.length,
          per_page: 12
        }
      };
    }
    
    return response;
  }

  async searchBusinesses(params: Record<string, string | number | undefined>) {
    return this.request<{ businesses: Business[]; meta: PaginatedResponse["meta"] }>("/public/businesses/search", {
      params,
    });
  }

  async getBusiness(slug: string) {
    return this.request<{ business: Business }>(`/public/businesses/${slug}`);
  }

  async getFeaturedBusinesses(limit = 10) {
    return this.request<{ businesses: Business[] }>("/public/businesses/featured", {
      params: { limit },
    });
  }

  async getNearbyBusinesses(lat: number, lng: number, radius = 10, limit = 20) {
    return this.request<{ businesses: Business[] }>("/public/businesses/nearby", {
      params: { lat, lng, radius, limit },
    });
  }

  async getPublicBusinessServices(slug: string) {
    return this.request<{ services: Service[] }>(`/public/businesses/${slug}/services`);
  }

  /** Public: get a single service by id (for booking flow; same scope as business services). */
  async getPublicService(id: number) {
    return this.request<{ service: Service }>(`/public/services/${id}`);
  }

  /** Public: availability slots for a service (for booking flow). */
  async getPublicServiceAvailability(
    serviceId: number,
    date: string,
    endDate?: string
  ) {
    const params: Record<string, string> = { date };
    if (endDate) params.end_date = endDate;
    return this.request<{
      date?: string;
      service_id: number;
      duration: number;
      slots?: Array<{ time: string; end_time: string; available: boolean; duration: number }>;
      calendar?: Array<{
        date: string;
        day_name: string;
        is_open: boolean;
        slots: Array<{ time: string; end_time: string; available: boolean; duration: number }>;
      }>;
    }>(`/public/services/${serviceId}/availability`, { params });
  }

  /** Public: next available time slots for a business (uses first service; set by business admin). */
  async getPublicBusinessAvailability(
    slug: string,
    startDate: string,
    endDate?: string
  ) {
    return this.request<{
      business_slug: string;
      service_id?: number;
      calendar: Array<{
        date: string;
        day_name: string;
        is_open: boolean;
        slots: Array<{ time: string; end_time: string; available: boolean; duration: number }>;
      }>;
    }>(`/public/businesses/${encodeURIComponent(slug)}/availability`, {
      params: { date: startDate, end_date: endDate },
    });
  }

  async getBusinessReviewsPublic(slug: string, params?: { page?: number }) {
    return this.request<{ reviews: Review[]; meta: PaginatedResponse["meta"] }>(
      `/public/businesses/${slug}/reviews`,
      { params: params as Record<string, number | undefined> }
    );
  }

  /** Public: submit a claim request for this business (owner verification). No auth required. */
  async submitBusinessClaim(
    slug: string,
    data: { name: string; email: string; message?: string }
  ) {
    return this.request<{ message: string }>(`/public/businesses/${encodeURIComponent(slug)}/claim`, {
      method: "POST",
      body: JSON.stringify({ claim_request: data }),
    });
  }

  // ========== Authenticated Business API (For owners/admins) ==========
  async getMyBusinesses() {
    return this.request<{ businesses: Business[]; meta?: PaginatedResponse["meta"] }>("/provider/businesses");
  }

  async getBusinessById(id: number) {
    return this.request<{ business: Business }>(`/provider/businesses/${id}`);
  }

  async createBusiness(data: Partial<Business>) {
    return this.request<{ business: Business }>("/provider/businesses", {
      method: "POST",
      body: JSON.stringify({ business: data }),
    });
  }

  async updateBusiness(id: number, data: Partial<Business>) {
    return this.request<{ business: Business }>(`/provider/businesses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ business: data }),
    });
  }

  /**
   * Update business with optional logo and gallery images (multipart).
   * Use when the form includes new files to upload.
   * Pass onProgress to get upload progress (0–100).
   */
  async updateBusinessWithFiles(
    id: number,
    data: Record<string, unknown>,
    files: { logo?: File; images?: File[] },
    options?: { onProgress?: (percent: number) => void }
  ) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "opening_hours" && typeof value === "object" && value !== null) {
        const hours = value as Record<string, { open?: string | null; close?: string | null } | null>;
        Object.entries(hours).forEach(([day, dayHours]) => {
          if (dayHours && typeof dayHours === "object" && (dayHours.open != null || dayHours.close != null)) {
            formData.append(`business[opening_hours][${day}][open]`, String(dayHours.open ?? ""));
            formData.append(`business[opening_hours][${day}][close]`, String(dayHours.close ?? ""));
          }
        });
        return;
      }
      if (typeof value === "object" && value !== null && !(value instanceof File)) {
        formData.append(`business[${key}]`, JSON.stringify(value));
        return;
      }
      formData.append(`business[${key}]`, String(value));
    });
    if (files.logo) {
      formData.append("business[logo]", files.logo);
    }
    if (files.images?.length) {
      files.images.forEach((file) => formData.append("business[images][]", file));
    }
    const url = `${this.baseUrl}/provider/businesses/${id}`;
    const locale =
      typeof document !== "undefined"
        ? normalizeLocale(getLocaleCookie() || "fr")
        : "fr";
    const response =
      options?.onProgress != null
        ? await formDataUpload(url, formData, { method: "PATCH", onProgress: options.onProgress, locale })
        : await fetch(url, {
            method: "PATCH",
            body: formData,
            credentials: "include",
            headers: { "X-Locale": locale },
          });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(
        response.status,
        (error as { error?: string }).error || (error as { errors?: string[] }).errors?.join(", ") || "Update failed",
        (error as { errors?: string[] }).errors
      );
    }
    return response.json() as Promise<{ business: Business }>;
  }

  async deleteBusiness(id: number) {
    return this.request<void>(`/provider/businesses/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Add gallery photos to a business via Cloudinary. Uses POST .../businesses/:id/images with FormData (images[]).
   * Returns uploaded images with URLs and public_ids, plus any errors.
   */
  async addBusinessPhotos(
    businessId: number,
    files: File[],
    options?: { onProgress?: (percent: number) => void }
  ): Promise<{ images: Array<{ url: string; public_id: string }>; errors?: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));
    const locale =
      typeof document !== "undefined"
        ? normalizeLocale(getLocaleCookie() || "fr")
        : "fr";
    const url = `${this.baseUrl}/provider/businesses/${businessId}/images`;
    const response =
      options?.onProgress != null
        ? await formDataUpload(url, formData, { method: "POST", onProgress: options.onProgress, locale })
        : await fetch(url, {
            method: "POST",
            body: formData,
            credentials: "include",
            headers: { "X-Locale": locale },
          });
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Upload failed" }));
      const msg = (body as { error?: string }).error || "Upload failed";
      throw new ApiError(response.status, msg, (body as { errors?: string[] }).errors);
    }
    return response.json() as Promise<{ images: Array<{ url: string; public_id: string }>; errors?: string[] }>;
  }

  /**
   * Remove one gallery photo by public_id via Cloudinary. Uses DELETE .../businesses/:id/images/:public_id.
   */
  async removeBusinessPhoto(businessId: number, publicId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/provider/businesses/${businessId}/images/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
  }

  // Service Categories
  async getServiceCategories(businessId: number, includeArchived = false) {
    return this.request<{ categories: ServiceCategory[] }>(
      `/provider/businesses/${businessId}/service_categories?include_archived=${includeArchived}`
    );
  }

  async createServiceCategory(businessId: number, data: ServiceCategoryInput) {
    return this.request<{ category: ServiceCategory }>(`/provider/businesses/${businessId}/service_categories`, {
      method: "POST",
      body: JSON.stringify({ service_category: data }),
    });
  }

  async updateServiceCategory(businessId: number, id: number, data: ServiceCategoryInput) {
    return this.request<{ category: ServiceCategory }>(`/provider/businesses/${businessId}/service_categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ service_category: data }),
    });
  }

  async deleteServiceCategory(businessId: number, id: number) {
    return this.request(`/provider/businesses/${businessId}/service_categories/${id}`, {
      method: "DELETE",
    });
  }

  async archiveServiceCategory(businessId: number, id: number) {
    return this.request<{ category: ServiceCategory }>(`/provider/businesses/${businessId}/service_categories/${id}/archive`, {
      method: "POST",
    });
  }

  async unarchiveServiceCategory(businessId: number, id: number) {
    return this.request<{ category: ServiceCategory }>(`/provider/businesses/${businessId}/service_categories/${id}/unarchive`, {
      method: "POST",
    });
  }

  async reorderServiceCategories(businessId: number, order: number[]) {
    return this.request(`/provider/businesses/${businessId}/service_categories/reorder`, {
      method: "POST",
      body: JSON.stringify({ order }),
    });
  }

  async generateCategoryDescription(businessId: number, id: number) {
    // Deprecated Rails-based endpoint – keep signature for backwards compatibility,
    // but route the call through the Next.js AI endpoint instead.
    try {
      const response = await fetch("/api/provider/generate-category-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          // We no longer know the category name here, so let the caller
          // prefer the direct fetch-based integration instead.
          categoryName: `Category ${id}`,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new ApiError(
          response.status,
          text || "Failed to generate description"
        );
      }

      const description = await response.text();
      return { description };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to generate description");
    }
  }

  async getBusinessStats(id: number) {
    return this.request<{
      total_bookings: number;
      completed_bookings: number;
      pending_bookings: number;
      total_revenue: number;
      average_rating: number;
      total_reviews: number;
    }>(`/provider/businesses/${id}/stats`);
  }

  async getBusinessBookings(
    id: number,
    params?: { start_date?: string; end_date?: string; status?: string; user_id?: number; per_page?: number }
  ) {
    return this.request<{ bookings: Booking[]; meta: PaginatedResponse["meta"] }>(`/provider/businesses/${id}/bookings`, {
      params: params as Record<string, string | number | undefined>,
    });
  }

  // ========== Business Staff ==========
  async getBusinessStaff(businessId: number) {
    return this.request<{ staff: StaffMember[] }>(`/provider/businesses/${businessId}/staff`);
  }

  async getBusinessClients(
    businessId: number,
    params?: { q?: string; per_page?: number; page?: number }
  ) {
    return this.request<{ clients: Client[] }>(`/provider/businesses/${businessId}/clients`, {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async createBusinessClient(
    businessId: number,
    data: { first_name: string; last_name?: string; name?: string; phone?: string; email?: string }
  ) {
    return this.request<{ client: Client }>(`/provider/businesses/${businessId}/clients`, {
      method: "POST",
      body: JSON.stringify({ client: data }),
    });
  }

  async addBusinessStaff(businessId: number, userId: number, role?: string) {
    return this.request<{ staff_member: StaffMember }>(`/provider/businesses/${businessId}/staff/${userId}`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  }

  async removeBusinessStaff(businessId: number, userId: number) {
    return this.request<void>(`/provider/businesses/${businessId}/staff/${userId}`, {
      method: "DELETE",
    });
  }

  async updateBusinessStaff(
    businessId: number,
    userId: number,
    params: { role: string }
  ) {
    return this.request<{ staff_member: StaffMember }>(
      `/provider/businesses/${businessId}/staff/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(params),
      }
    );
  }

  async inviteBusinessStaff(
    businessId: number,
    params: { email: string; first_name?: string; last_name?: string; name?: string; role?: string }
  ) {
    return this.request<{ staff_member: StaffMember }>(
      `/provider/businesses/${businessId}/staff`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
  }

  async getBusinessAvailabilities(businessId: number, params?: { user_id?: number }) {
    return this.request<{ availabilities: StaffAvailability[] }>(`/provider/businesses/${businessId}/availabilities`, {
      params: params as Record<string, number | undefined>,
    });
  }

  // ========== Provider Dashboard ==========
  async getProviderDashboard() {
    return this.request<{
      businesses: Business[];
      stats: {
        total_businesses: number;
        total_bookings: number;
        pending_bookings: number;
        confirmed_bookings: number;
        completed_bookings: number;
        total_revenue: number;
        average_rating: number;
      };
    }>("/provider/dashboard");
  }

  async getProviderBusinesses() {
    return this.request<{ businesses: Business[] }>("/provider/businesses");
  }

  async getProviderBookings(params?: {
    business_id?: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }) {
    return this.request<{ bookings: Booking[]; meta: PaginatedResponse["meta"] }>("/provider/bookings", {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getProviderCalendar(params: {
    business_id: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    return this.request<{
      events: CalendarEvent[];
      staff: StaffMember[];
    }>("/provider/calendar", {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getProviderStats(businessId?: number) {
    return this.request<{
      total_bookings: number;
      pending_bookings: number;
      confirmed_bookings: number;
      completed_bookings: number;
      cancelled_bookings?: number;
      total_revenue: number;
      average_rating: number;
      total_reviews?: number;
      staff_count?: number;
      service_count?: number;
    }>("/provider/stats", {
      params: businessId ? { business_id: businessId } : undefined,
    });
  }

  /** Global provider search (GET /provider/search?q=...) */
  async getProviderSearch(query: string): Promise<ProviderSearchResults> {
    return this.request<ProviderSearchResults>("/provider/search", {
      params: { q: query },
    });
  }

  // ========== Services ==========

  /** List services for a business (GET /provider/businesses/:id/services). Backend may return array or { services }. */
  async getBusinessServices(businessId: number) {
    const res = await this.request<Service[] | { services: Service[] }>(
      `/provider/businesses/${businessId}/services`
    );
    // Always return { services: [...] } format
    if (Array.isArray(res)) {
      return { services: res };
    }
    return { services: res.services ?? [] };
  }

  async getService(id: number) {
    return this.request<{ service: Service }>(`/provider/services/${id}`);
  }

  async getServiceAvailability(id: number, date: string, endDate?: string) {
    return this.request<{
      service_id: number;
      duration: number;
      date?: string;
      slots?: Array<{ time: string; end_time: string; available: boolean; duration: number }>;
      calendar?: Array<{
        date: string;
        day_name: string;
        is_open: boolean;
        slots: Array<{ time: string; end_time: string; available: boolean; duration: number }>;
      }>;
    }>(`/provider/services/${id}/availability`, {
      params: { date, end_date: endDate },
    });
  }

  async createService(businessId: number, data: Partial<Service>) {
    return this.request<{ service: Service }>(`/provider/businesses/${businessId}/services`, {
      method: "POST",
      body: JSON.stringify({ service: data }),
    });
  }

  async updateService(id: number, data: Partial<Service>) {
    return this.request<{ service: Service }>(`/provider/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ service: data }),
    });
  }

  async deleteService(id: number) {
    return this.request<void>(`/provider/services/${id}`, {
      method: "DELETE",
    });
  }

  // ========== Bookings ==========
  async getBookings(params?: { status?: string; upcoming?: boolean; past?: boolean; page?: number }) {
    return this.request<{ bookings: Booking[]; meta: PaginatedResponse["meta"] }>("/customer/bookings", {
      params: {
        status: params?.status,
        upcoming: params?.upcoming ? "true" : undefined,
        past: params?.past ? "true" : undefined,
        page: params?.page,
      },
    });
  }

  async getBooking(id: number) {
    return this.request<{ booking: Booking }>(`/customer/bookings/${id}`);
  }

  /** Single-service or multi-service (services[]). When client_id is set, backend fills customer_* from Client. */
  async createBooking(data: {
    service_id?: number;
    date: string;
    start_time: string;
    end_time?: string;
    staff_id?: number;
    notes?: string;
    customer_name?: string;
    customer_first_name?: string;
    customer_last_name?: string;
    customer_phone?: string;
    customer_email?: string;
    client_id?: number;
    skip_business_hours_check?: boolean;
    services?: Array<{ service_id: number; staff_id?: number; price?: number; duration_minutes?: number }>;
  }) {
    const { skip_business_hours_check, ...rest } = data;
    const booking: Record<string, unknown> = { ...rest };
    if (skip_business_hours_check === true) booking.skip_business_hours_check = true;
    const body = { booking };
    return this.request<{ booking: Booking }>("/customer/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /** Public confirmation by short_booking_id (no auth required) */
  async getBookingConfirmation(shortBookingId: string) {
    return this.request<BookingConfirmation>(`/public/bookings/${encodeURIComponent(shortBookingId)}`);
  }

  async updateBooking(id: number, data: { date?: string; start_time?: string; notes?: string; skip_availability_check?: boolean }) {
    return this.request<{ booking: Booking }>(`/customer/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ 
        booking: data
      }),
    });
  }

  async confirmBooking(id: number) {
    return this.request<{ booking: Booking }>(`/customer/bookings/${id}/confirm`, {
      method: "POST",
    });
  }

  async cancelBooking(id: number) {
    return this.request<{ booking: Booking }>(`/customer/bookings/${id}/cancel`, {
      method: "POST",
    });
  }

  async completeBooking(id: number) {
    return this.request<{ booking: Booking }>(`/customer/bookings/${id}/complete`, {
      method: "POST",
    });
  }

  // ========== Reviews ==========

  async createReview(data: { booking_id: number; rating: number; comment?: string }) {
    return this.request<{ review: Review }>("/customer/reviews", {
      method: "POST",
      body: JSON.stringify({ review: data }),
    });
  }

  async updateReview(id: number, data: { rating?: number; comment?: string }) {
    return this.request<{ review: Review }>(`/customer/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ review: data }),
    });
  }

  async deleteReview(id: number) {
    return this.request<void>(`/customer/reviews/${id}`, {
      method: "DELETE",
    });
  }

  // ========== Payments ==========
  async createPaymentIntent(bookingId: number) {
    return this.request<{ client_secret: string; payment_intent_id: string }>("/customer/booking_payments/create_intent", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  // ========== Search Metadata ==========
  async getCities() {
    return this.request<{
      cities: Array<{
        name: string;
        slug: string;
        business_count: number;
        lat?: number;
        lng?: number;
      }>;
    }>("/public/search_metadata/cities");
  }

  async getCategories() {
    return this.request<{
      categories: Array<{ name: string; slug: string; business_count: number }>;
    }>("/public/search_metadata/categories");
  }

  async getCategoriesHierarchy() {
    return this.request<{
      acts: Array<{
        id: number;
        name: string;
        slug: string;
        position: number;
        subacts: Array<{ id: number; name: string; slug: string; position: number }>;
      }>;
    }>("/public/search_metadata/categories_hierarchy");
  }

  async getFilters() {
    return this.request<{
      cities: Array<{
        name: string;
        slug: string;
        business_count: number;
        lat?: number;
        lng?: number;
      }>;
      categories: Array<{ name: string; slug: string; business_count: number }>;
      price_range: { min: number; max: number };
    }>("/public/search_metadata/filters");
  }

  // ========== File Uploads ==========

  /**
   * Get a presigned URL for direct upload to storage (MinIO in dev, Cloudinary in prod)
   */
  async getUploadPresignedUrl(file: File) {
    // Calculate checksum (MD5 in base64)
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("MD5", buffer).catch(() => null);
    const checksum = hashBuffer
      ? btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      : undefined;

    return this.request<{
      direct_upload: {
        url: string;
        headers: Record<string, string>;
      };
      blob_signed_id: string;
    }>("/uploads/presign", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        byte_size: file.size,
        content_type: file.type,
        checksum,
      }),
    });
  }

  /**
   * Upload a file directly to storage
   */
  async uploadFile(file: File): Promise<{ signed_id: string; url: string }> {
    // Get presigned URL
    const { direct_upload, blob_signed_id } = await this.getUploadPresignedUrl(file);

    // Upload to storage
    const uploadResponse = await fetch(direct_upload.url, {
      method: "PUT",
      headers: direct_upload.headers,
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new ApiError(uploadResponse.status, "Failed to upload file");
    }

    // Confirm upload
    const { url } = await this.request<{ blob_id: number; signed_id: string; url: string }>(
      "/uploads/confirm",
      {
        method: "POST",
        body: JSON.stringify({ signed_id: blob_signed_id }),
      }
    );

    return { signed_id: blob_signed_id, url };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[]): Promise<Array<{ signed_id: string; url: string }>> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}

export const api = new ApiClient(API_URL);
export default api;
