/**
 * Analytics Feature — Type Definitions
 * @module src/features/analytics/types
 */

export interface KpiMetric {
  label: string;
  value: number | string;
  delta?: number;       // percentage change vs. previous period
  trend: "up" | "down" | "flat";
}

export interface ChartDataPoint {
  label: string;        // x-axis label (e.g. date, month)
  value: number;
}

export interface AnalyticsDashboard {
  kpis: KpiMetric[];
  bookingsTrend: ChartDataPoint[];
  revenueTrend: ChartDataPoint[];
  topCategories: { category: string; count: number }[];
}
