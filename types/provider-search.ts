export interface SearchBooking {
  id: number;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  staff_name: string;
  business_name: string;
  start_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  price: number;
}

export interface SearchCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
  total_bookings: number;
  tags?: string[];
}

export interface SearchService {
  id: number;
  name: string;
  duration: number;
  price: number;
  category: string;
  business_name: string;
}

export interface SearchStaff {
  id: number;
  name: string;
  email: string;
  role: string;
  business_name: string;
  avatar_url?: string;
  available_today: boolean;
}

export interface SearchBusiness {
  id: number;
  name: string;
  city: string;
  category: string;
  status: "open" | "closed";
}

export interface SearchReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  business_name: string;
  created_at: string;
}

export interface SearchShortcut {
  id: string;
  label: string;
  href: string;
  icon: string;
  category: string;
}

/** Alias for navigation/shortcut actions in global search */
type ShortcutAction = SearchShortcut;

export interface ProviderSearchResults {
  bookings: SearchBooking[];
  customers: SearchCustomer[];
  services: SearchService[];
  staff: SearchStaff[];
  businesses: SearchBusiness[];
  reviews: SearchReview[];
  shortcuts: SearchShortcut[];
}
