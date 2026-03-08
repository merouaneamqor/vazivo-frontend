/**
 * Query key factory for TanStack Query.
 * Kept in a separate module (no "use client", no React) to avoid HMR issues
 * and to allow importing keys without pulling in the full query-client provider.
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  businesses: {
    all: ["businesses"] as const,
    list: (filters: Record<string, unknown>) => ["businesses", "list", filters] as const,
    detail: (slugOrId: string | number) => ["businesses", "detail", slugOrId] as const,
    stats: (slugOrId: string | number) => ["businesses", "stats", slugOrId] as const,
    bookings: (slugOrId: string | number, filters?: Record<string, unknown>) =>
      ["businesses", "bookings", slugOrId, filters] as const,
    staff: (businessId: number) => ["businesses", "staff", businessId] as const,
    clients: (businessId: number, filters?: { q?: string; per_page?: number; page?: number }) =>
      ["businesses", "clients", businessId, filters] as const,
    availabilities: (businessId: number, staffId?: number) =>
      ["businesses", "availabilities", businessId, staffId] as const,
  },
  services: {
    all: ["services"] as const,
    list: (businessId: number) => ["businesses", businessId, "services"] as const,
    detail: (id: number) => ["services", "detail", id] as const,
    availability: (id: number, date: string, endDate?: string) =>
      ["services", "availability", id, date, endDate] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (filters?: Record<string, unknown>) => ["bookings", "list", filters] as const,
    detail: (id: number) => ["bookings", "detail", id] as const,
  },
  reviews: {
    business: (businessId: number, filters?: Record<string, unknown>) =>
      ["reviews", "business", businessId, filters] as const,
  },
  businessAvailability: (slug: string, startDate: string, endDate?: string) =>
    ["public", "businesses", slug, "availability", startDate, endDate] as const,
  publicServiceAvailability: (serviceId: number, date: string, endDate?: string) =>
    ["public", "services", serviceId, "availability", date, endDate] as const,
  searchMetadata: {
    cities: (locale: string) => ["search_metadata", "cities", locale] as const,
    categories: (locale: string) => ["search_metadata", "categories", locale] as const,
    filters: (locale: string) => ["search_metadata", "filters", locale] as const,
  },
  provider: {
    dashboard: ["provider", "dashboard"] as const,
    businesses: ["provider", "businesses"] as const,
    stats: (businessId?: number) => ["provider", "stats", businessId] as const,
    bookings: (filters: { business_id?: number; user_id?: number; start_date?: string; end_date?: string; status?: string }) =>
      ["provider", "bookings", filters] as const,
    calendar: (params: { business_id: number; user_id?: number; start_date?: string; end_date?: string }) =>
      ["provider", "calendar", params.business_id, params.user_id, params.start_date, params.end_date] as const,
  },
  admin: {
    me: ["admin", "me"] as const,
    dashboard: ["admin", "dashboard"] as const,
    users: (filters?: Record<string, unknown>) => ["admin", "users", filters] as const,
    user: (id: number) => ["admin", "users", id] as const,
    providers: (filters?: Record<string, unknown>) => ["admin", "providers", filters] as const,
    provider: (id: number) => ["admin", "providers", id] as const,
    bookings: (filters?: Record<string, unknown>) => ["admin", "bookings", filters] as const,
    booking: (id: number) => ["admin", "bookings", id] as const,
    reviews: (filters?: Record<string, unknown>) => ["admin", "reviews", filters] as const,
    review: (id: number) => ["admin", "reviews", id] as const,
    claimRequests: (filters?: Record<string, unknown>) => ["admin", "claimRequests", filters] as const,
    claimRequest: (id: number) => ["admin", "claimRequests", id] as const,
    finance: ["admin", "finance"] as const,
    categories: ["admin", "categories"] as const,
    plans: ["admin", "plans"] as const,
    cities: ["admin", "cities"] as const,
    seoPages: ["admin", "seoPages"] as const,
    settings: ["admin", "settings"] as const,
    staff: (filters?: Record<string, unknown>) => ["admin", "staff", filters] as const,
    reports: ["admin", "reports"] as const,
  },
};
