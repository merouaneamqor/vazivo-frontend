export interface ProviderInvoice {
  id: number;
  invoice_id: string;
  business_id: number;
  business_name: string;
  subscription_id: number | null;
  plan_id: string | null;
  total: number;
  currency: string;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

export interface InvoiceStats {
  total_revenue: number;
  pending_revenue: number;
  total_count: number;
  paid_count: number;
  by_month: Record<string, number>;
  by_status: Record<string, number>;
  by_payment_method: Record<string, number>;
}

export interface InvoicesResponse {
  invoices: ProviderInvoice[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
  stats: InvoiceStats;
}

export interface InvoiceFilters {
  q?: string;
  status?: string;
  payment_method?: string;
  paid_after?: string;
  paid_before?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  per_page?: number;
}
