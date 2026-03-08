import type {
  AdminUser,
  AdminDashboard,
  AdminCustomerListItem,
  AdminProviderListItem,
  AdminProviderDetail,
  AdminProvidersFilters,
  AdminPlan,
  AdminBookingListItem,
  AdminReviewListItem,
  AdminClaimRequestListItem,
  PaginatedMeta,
  AdminAct,
  AdminCategory,
  AdminCity,
  AdminNeighborhood,
  AdminSeoPage,
  AdminActivityLogEntry,
} from "@/types/admin";
import type { AdminReports } from "@/types/reports";
import type { InvoicesResponse, InvoiceFilters } from "@/types/invoice";

function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:3000/api/v1";
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

const API_URL = getApiBaseUrl();
const ADMIN_PREFIX = "/admin";

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string[]
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
}

function buildRequest(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { params, ...fetchOptions } = options;
  let url = `${API_URL}${ADMIN_PREFIX}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  return fetch(url, {
    ...fetchOptions,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new AdminApiError(
      res.status,
      err.error || err.errors?.join(", ") || "Request failed",
      err.errors
    );
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// ========== Auth ==========
export async function adminLogin(
  email: string,
  password: string,
  _twoFactorCode?: string
): Promise<{ user: AdminUser; access_token: string; expires_in: number }> {
  const res = await buildRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ user: { email, password } }),
  });
  return handleResponse(res);
}

export async function adminMe(): Promise<{ user: AdminUser }> {
  const res = await buildRequest("/auth/me");
  return handleResponse(res);
}

// ========== Dashboard ==========
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await buildRequest("/dashboard");
  return handleResponse(res);
}

// ========== Customers (Users) ==========
export async function getAdminUsers(params?: {
  q?: string;
  role?: string;
  exclude_role?: string;
  page?: number;
  per_page?: number;
}): Promise<{ users: AdminCustomerListItem[]; meta: PaginatedMeta }> {
  const res = await buildRequest("/users", { params: params as Record<string, unknown> });
  return handleResponse(res);
}

export async function getAdminUser(
  id: number
): Promise<{ user: AdminCustomerListItem & { bookings?: unknown[]; reviews?: unknown[] } }> {
  const res = await buildRequest(`/users/${id}`);
  return handleResponse(res);
}

export async function updateAdminUser(
  id: number,
  data: Partial<AdminCustomerListItem>
): Promise<{ user: AdminCustomerListItem }> {
  const res = await buildRequest(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ user: data }),
  });
  return handleResponse(res);
}

export async function suspendAdminUser(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/users/${id}/suspend`, { method: "POST" });
  return handleResponse(res);
}

export async function unsuspendAdminUser(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/users/${id}/unsuspend`, { method: "POST" });
  return handleResponse(res);
}

export async function forcePasswordReset(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/users/${id}/force_password_reset`, { method: "POST" });
  return handleResponse(res);
}

export async function deleteAdminUser(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/users/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ========== Providers ==========
export async function getAdminProviders(
  params?: AdminProvidersFilters
): Promise<{ providers: AdminProviderListItem[]; meta: PaginatedMeta }> {
  const res = await buildRequest("/providers", { params: params as Record<string, unknown> });
  return handleResponse(res);
}

export async function getAdminProvider(id: number): Promise<{
  provider: AdminProviderDetail;
}> {
  const res = await buildRequest(`/providers/${id}`);
  return handleResponse(res);
}

export async function createAdminProvider(data: {
  user_id: number;
  name: string;
  category?: string;
  categories?: string[];
  address: string;
  city: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  neighborhood?: string;
  country?: string;
  opening_hours?: Record<string, Array<{ open: string; close: string }>>;
}): Promise<{ provider: AdminProviderListItem }> {
  const res = await buildRequest("/providers", {
    method: "POST",
    body: JSON.stringify({ provider: data }),
  });
  return handleResponse(res);
}

export async function updateAdminProvider(
  id: number,
  data: Record<string, unknown>
): Promise<{ provider: AdminProviderListItem }> {
  const res = await buildRequest(`/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ provider: data }),
  });
  return handleResponse(res);
}

export async function approveProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/approve`, { method: "POST" });
  return handleResponse(res);
}

export async function unconfirmProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/unconfirm`, { method: "POST" });
  return handleResponse(res);
}

export async function rejectProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/reject`, { method: "POST" });
  return handleResponse(res);
}

export async function suspendProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/suspend`, { method: "POST" });
  return handleResponse(res);
}

export async function impersonateProvider(id: number): Promise<{
  message: string;
  access_token?: string;
  expires_in?: number;
}> {
  const res = await buildRequest(`/providers/${id}/impersonate`, { method: "POST" });
  return handleResponse(res);
}

export async function verifyProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/verify`, { method: "POST" });
  return handleResponse(res);
}

export async function unverifyProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/unverify`, { method: "POST" });
  return handleResponse(res);
}

export async function reactivateProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/reactivate`, { method: "POST" });
  return handleResponse(res);
}

export async function sendOnboardingEmailProvider(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/providers/${id}/send_onboarding_email`, { method: "POST" });
  return handleResponse(res);
}

export async function upgradeProviderPremium(
  id: number,
  data: {
    plan_id?: string;
    expires_at: string;
    paid_via: string;
    amount?: number;
    note?: string;
  }
): Promise<{ message: string; business_id: number; premium_expires_at: string | null }> {
  const res = await buildRequest(`/providers/${id}/upgrade`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ========== Plans ==========
export async function getAdminPlans(): Promise<{ plans: AdminPlan[] }> {
  const res = await buildRequest("/plans");
  return handleResponse(res);
}

export async function createAdminPlan(data: {
  name: string;
  identifier: string;
  duration_months: number;
  suggested_price?: number;
  currency?: string;
  active?: boolean;
  position?: number;
}): Promise<{ plan: AdminPlan }> {
  const res = await buildRequest("/plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAdminPlan(
  id: number,
  data: Partial<{
    name: string;
    identifier: string;
    duration_months: number;
    suggested_price: number;
    currency: string;
    active: boolean;
    position: number;
  }>
): Promise<{ plan: AdminPlan }> {
  const res = await buildRequest(`/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAdminPlan(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/plans/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ========== Bookings ==========
export async function getAdminBookings(params?: {
  status?: string;
  provider_id?: number;
  customer_id?: number;
  page?: number;
  per_page?: number;
}): Promise<{ bookings: AdminBookingListItem[]; meta: PaginatedMeta }> {
  const res = await buildRequest("/bookings", { params: params as Record<string, unknown> });
  return handleResponse(res);
}

/** Nested objects returned with admin booking detail */
export interface AdminBookingDetailCustomer {
  id?: number;
  name?: string;
  email?: string;
}
export interface AdminBookingDetailProvider {
  id?: number;
  name?: string;
}
export interface AdminBookingDetailService {
  id?: number;
  name?: string;
}
export interface AdminBookingDetailPayment {
  status?: string;
}

export async function getAdminBooking(id: number): Promise<{
  booking: AdminBookingListItem;
  customer?: AdminBookingDetailCustomer;
  provider?: AdminBookingDetailProvider;
  service?: AdminBookingDetailService;
  payment?: AdminBookingDetailPayment;
}> {
  const res = await buildRequest(`/bookings/${id}`);
  return handleResponse(res);
}

export async function updateAdminBooking(
  id: number,
  data: { date?: string; start_time?: string; end_time?: string; status?: string }
): Promise<{ booking: AdminBookingListItem }> {
  const res = await buildRequest(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ booking: data }),
  });
  return handleResponse(res);
}

export async function cancelAdminBooking(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/bookings/${id}/cancel`, { method: "POST" });
  return handleResponse(res);
}

export async function refundAdminBooking(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/bookings/${id}/refund`, { method: "POST" });
  return handleResponse(res);
}

// ========== Reviews ==========
export async function getAdminReviews(params?: {
  rating?: number;
  business_id?: number;
  user_id?: number;
  page?: number;
  per_page?: number;
}): Promise<{ reviews: AdminReviewListItem[]; meta: PaginatedMeta }> {
  const res = await buildRequest("/reviews", { params: params as Record<string, unknown> });
  return handleResponse(res);
}

export async function getAdminReview(id: number): Promise<{
  review: AdminReviewListItem & { comment?: string };
  user?: unknown;
  business?: unknown;
}> {
  const res = await buildRequest(`/reviews/${id}`);
  return handleResponse(res);
}

export async function updateAdminReview(
  id: number,
  data: { rating?: number; comment?: string; moderation_status?: string; moderation_notes?: string }
): Promise<{ review: AdminReviewListItem }> {
  const res = await buildRequest(`/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ review: data }),
  });
  return handleResponse(res);
}

export async function deleteAdminReview(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/reviews/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

export async function hideAdminReview(id: number): Promise<{ message: string; review: AdminReviewListItem }> {
  const res = await buildRequest(`/reviews/${id}/hide`, { method: "POST" });
  return handleResponse(res);
}

export async function unhideAdminReview(id: number): Promise<{ message: string; review: AdminReviewListItem }> {
  const res = await buildRequest(`/reviews/${id}/unhide`, { method: "POST" });
  return handleResponse(res);
}

export async function flagAdminReview(id: number, reason: string): Promise<{ message: string; review: AdminReviewListItem }> {
  const res = await buildRequest(`/reviews/${id}/flag`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function unflagAdminReview(id: number): Promise<{ message: string; review: AdminReviewListItem }> {
  const res = await buildRequest(`/reviews/${id}/unflag`, { method: "POST" });
  return handleResponse(res);
}

// ========== Claim requests ==========
export async function getAdminClaimRequests(params?: {
  status?: string;
  business_id?: number;
  page?: number;
  per_page?: number;
}): Promise<{ claim_requests: AdminClaimRequestListItem[]; meta: PaginatedMeta }> {
  const res = await buildRequest("/claim_requests", { params: params as Record<string, unknown> });
  return handleResponse(res);
}

export async function getAdminClaimRequest(id: number): Promise<{
  claim_request: AdminClaimRequestListItem & { message?: string };
  business?: unknown;
  user?: unknown;
}> {
  const res = await buildRequest(`/claim_requests/${id}`);
  return handleResponse(res);
}

export async function approveClaimRequest(id: number): Promise<{
  claim_request: AdminClaimRequestListItem;
  message: string;
}> {
  const res = await buildRequest(`/claim_requests/${id}/approve`, { method: "POST" });
  return handleResponse(res);
}

export async function rejectClaimRequest(id: number): Promise<{
  claim_request: AdminClaimRequestListItem;
  message: string;
}> {
  const res = await buildRequest(`/claim_requests/${id}/reject`, { method: "POST" });
  return handleResponse(res);
}

// ========== Finance ==========
export async function getAdminBusinessInvoices(params?: InvoiceFilters): Promise<InvoicesResponse> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const res = await buildRequest(`/finance/invoices${query}`);
  return handleResponse(res);
}

export async function getAdminPayouts(): Promise<{
  pending: unknown[];
  completed: unknown[];
  failed: unknown[];
}> {
  const res = await buildRequest("/finance/payouts");
  return handleResponse(res);
}

export async function getAdminEarnings(): Promise<{
  total_commission: number;
  by_month: Record<string, number>;
}> {
  const res = await buildRequest("/finance/earnings");
  return handleResponse(res);
}

export async function getAdminFinanceLogs(): Promise<{ booking_payments: unknown[] }> {
  const res = await buildRequest("/finance/logs");
  return handleResponse(res);
}

// ========== Categories & Cities ==========
export async function getAdminCategories(): Promise<{ acts: AdminAct[] }> {
  const res = await buildRequest("/categories");
  return handleResponse(res);
}

/** Flatten acts + subacts into a simple { name, slug }[] list (for filters etc.) */
export function flattenCategories(acts: AdminAct[]): { name: string; slug: string }[] {
  const flat: { name: string; slug: string }[] = [];
  for (const act of acts) {
    flat.push({ name: act.name, slug: act.slug });
    for (const sub of act.subacts) {
      flat.push({ name: sub.name, slug: sub.slug });
    }
  }
  return flat;
}

export async function createAdminCategory(data: {
  name?: string;
  name_en?: string;
  name_fr?: string;
  name_ar?: string;
  slug_en?: string;
  slug_fr?: string;
  slug_ar?: string;
  parent_id?: number;
  position?: number;
}): Promise<{ category: AdminCategory }> {
  const res = await buildRequest("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAdminCategory(
  id: number,
  data: {
    name?: string;
    name_en?: string;
    name_fr?: string;
    name_ar?: string;
    slug_en?: string;
    slug_fr?: string;
    slug_ar?: string;
    position?: number;
  }
): Promise<{ category: AdminCategory }> {
  const res = await buildRequest(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAdminCategory(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/categories/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

export async function getAdminCities(): Promise<{ cities: AdminCity[] }> {
  const res = await buildRequest("/cities");
  return handleResponse(res);
}

/** Flatten cities into { name, slug }[] for filters (backend filters by business.city) */
export function flattenCities(cities: AdminCity[]): { name: string; slug: string }[] {
  return cities.map((c) => ({ name: c.name, slug: c.slug }));
}

export async function createAdminCity(data: { name: string; position?: number }): Promise<{
  city: AdminCity;
}> {
  const res = await buildRequest("/cities", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function createAdminNeighborhood(data: {
  city_id: number;
  name: string;
  position?: number;
}): Promise<{ neighborhood: AdminNeighborhood }> {
  const res = await buildRequest("/cities/neighborhoods", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAdminCity(
  id: number,
  data: { name?: string; position?: number }
): Promise<{ city: AdminCity }> {
  const res = await buildRequest(`/cities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAdminNeighborhood(
  id: number,
  data: { name?: string; position?: number }
): Promise<{ neighborhood: AdminNeighborhood }> {
  const res = await buildRequest(`/neighborhoods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAdminCity(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/cities/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

export async function deleteAdminNeighborhood(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/neighborhoods/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ========== SEO Pages ==========
export async function getAdminSeoPages(): Promise<{ seo_pages: AdminSeoPage[] }> {
  const res = await buildRequest("/seo_pages");
  return handleResponse(res);
}

export async function getAdminSeoPage(id: number): Promise<{ seo_page: AdminSeoPage }> {
  const res = await buildRequest(`/seo_pages/${id}`);
  return handleResponse(res);
}

export async function createAdminSeoPage(data: {
  path: string;
  title?: string | null;
  meta_description?: string | null;
  seo_text?: string | null;
  city?: string | null;
  service?: string | null;
  business_id?: number | null;
}): Promise<{ seo_page: AdminSeoPage }> {
  const res = await buildRequest("/seo_pages", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAdminSeoPage(
  id: number,
  data: {
    path?: string;
    title?: string | null;
    meta_description?: string | null;
    seo_text?: string | null;
    city?: string | null;
    service?: string | null;
    business_id?: number | null;
  }
): Promise<{ seo_page: AdminSeoPage }> {
  const res = await buildRequest(`/seo_pages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAdminSeoPage(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/seo_pages/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ========== Settings ==========
export async function getAdminSettings(): Promise<{
  maintenance_mode: boolean;
  cors_origins?: string;
  frontend_url?: string;
}> {
  const res = await buildRequest("/settings");
  return handleResponse(res);
}

// ========== Staff ==========
export type StaffItem = {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone?: string;
  locale?: string;
  admin_role: string;
  created_at: string;
};

export async function getAdminStaff(params?: {
  role?: string;
  page?: number;
  per_page?: number;
}): Promise<{ staff: StaffItem[]; meta: PaginatedMeta }> {
  const res = await buildRequest("/staff", { params: params as Record<string, unknown> });
  return handleResponse(res);
}

export type CreateStaffPayload = {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  phone?: string;
  locale?: string;
  admin_role: string;
};

export async function createAdminStaff(data: CreateStaffPayload): Promise<{
  staff: StaffItem;
  message: string;
}> {
  const res = await buildRequest("/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export type UpdateStaffPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  locale?: string;
  admin_role?: string;
};

export async function updateAdminStaff(
  id: number,
  data: UpdateStaffPayload
): Promise<{ user: unknown; staff: StaffItem }> {
  const res = await buildRequest(`/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function promoteToAdmin(user_id: number, admin_role: string): Promise<{
  staff: StaffItem;
  message: string;
}> {
  const res = await buildRequest("/staff/promote", {
    method: "POST",
    body: JSON.stringify({ user_id, admin_role }),
  });
  return handleResponse(res);
}

export async function suspendAdminStaff(id: number): Promise<{ message: string }> {
  const res = await buildRequest(`/staff/${id}/suspend`, { method: "POST" });
  return handleResponse(res);
}

// ========== Reports ==========
export async function getAdminReports(params?: { range?: string }): Promise<AdminReports> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  const res = await buildRequest(`/reports${query}`);
  return handleResponse(res);
}

export async function exportAdminReport(
  format: "csv" | "xlsx" | "pdf"
): Promise<{ download_url: string | null; message: string }> {
  const res = await buildRequest("/reports/export", { params: { format } });
  return handleResponse(res);
}

// ========== Support ==========
export async function supportImpersonate(userId: number): Promise<{
  message: string;
  access_token?: string;
  expires_in?: number;
}> {
  const res = await buildRequest("/support/impersonate", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(res);
}

export async function getSupportActivityLog(params?: {
  page?: number;
  per_page?: number;
  resource_type?: string;
  action_type?: string;
  since?: string;
}): Promise<{ logs: AdminActivityLogEntry[]; meta: PaginatedMeta }> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.per_page != null) search.set("per_page", String(params.per_page));
  if (params?.resource_type) search.set("resource_type", params.resource_type);
  if (params?.action_type) search.set("action_type", params.action_type);
  if (params?.since) search.set("since", params.since);
  const qs = search.toString();
  const url = qs ? `/support/activity_log?${qs}` : "/support/activity_log";
  const res = await buildRequest(url);
  return handleResponse(res);
}
