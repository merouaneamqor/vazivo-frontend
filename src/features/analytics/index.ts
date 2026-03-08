/**
 * Analytics Feature — Public API
 * @module src/features/analytics
 */

export type { KpiMetric, ChartDataPoint, AnalyticsDashboard } from "./types";
export { analyticsV2Flag, providerAnalyticsV2Flag } from "./flags";
export { analyticsApi } from "./api";

// Components
export { KpiCard } from "@/components/admin/KpiCard";
export { ChartCard } from "@/components/admin/ChartCard";
export { ChartJsBarCard, ChartJsDonutCard } from "@/components/admin/ChartJsCharts";
