export interface AdminReports {
  date_range: string;
  revenue: {
    current: number;
    previous: number;
    by_day: Record<string, number>;
    by_payment_method: Record<string, number>;
  };
  bookings: {
    current: number;
    previous: number;
    by_day: Record<string, number>;
    by_status: Record<string, number>;
    by_city: Record<string, number>;
    by_category: Record<string, number>;
  };
  providers: {
    new: number;
    active: number;
    top: { id: number; name: string; bookings: number }[];
  };
  customers: {
    new: number;
    active: number;
    retention_rate: number;
  };
  subscriptions: {
    new: number;
    churned: number;
    revenue: number;
    by_plan: Record<string, number>;
  };
  reviews: {
    average_rating: number;
    total: number;
    by_rating: Record<string, number>;
  };
}
