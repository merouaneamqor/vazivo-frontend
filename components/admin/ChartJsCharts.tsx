"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgb(38 38 38)",
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgb(245 245 245)" },
      ticks: { color: "rgb(115 115 115)", font: { size: 11 } },
    },
    x: {
      grid: { display: false },
      ticks: { color: "rgb(115 115 115)", font: { size: 10 }, maxRotation: 45 },
    },
  },
};

interface ChartJsBarCardProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
  /** Bar color (CSS or hex). Default primary. */
  barColor?: string;
  /** Use horizontal bars (for top cities/categories). */
  horizontal?: boolean;
}

export function ChartJsBarCard({
  title,
  data,
  height = 240,
  className,
  barColor = "rgb(224 99 82)",
  horizontal = false,
}: ChartJsBarCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = data.map((d) => {
    const c = d.color;
    if (c && (c.startsWith("rgb") || c.startsWith("#"))) return c;
    return barColor;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: colors.length ? colors : barColor,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...defaultOptions,
    indexAxis: (horizontal ? "y" : "x") as "x" | "y",
    scales: horizontal
      ? {
          x: {
            beginAtZero: true,
            grid: { color: "rgb(245 245 245)" },
            ticks: { color: "rgb(115 115 115)", font: { size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: { color: "rgb(115 115 115)", font: { size: 10 } },
          },
        }
      : defaultOptions.scales,
    plugins: {
      ...defaultOptions.plugins,
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: (ctx: { raw?: unknown }) =>
            horizontal
              ? String(ctx.raw ?? 0)
              : `${title}: ${ctx.raw ?? 0}`,
        },
      },
    },
  };

  return (
    <Card className={cn("rounded-xl", className)}>
      <CardHeader className="p-4 md:p-6 pb-2">
        <CardTitle className="text-sm md:text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-2">
        <div className="w-full" style={{ height }}>
          {!mounted ? (
            <div
              className="flex items-center justify-center text-neutral-400 text-sm bg-neutral-50 rounded-lg"
              style={{ height }}
              aria-hidden
            >
              Loading chart…
            </div>
          ) : data.length > 0 ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div
              className="flex items-center justify-center text-neutral-500 text-sm"
              style={{ height }}
            >
              No data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Chart.js Doughnut for status breakdown (e.g. Booking Status). Supports center text. */
interface ChartJsDonutCardProps {
  title: string;
  data: { label: string; value: number; color: string }[];
  centerValue?: string | number;
  centerLabel?: string;
  size?: number;
  className?: string;
}

export function ChartJsDonutCard({
  title,
  data,
  centerValue,
  centerLabel,
  size = 160,
  className,
}: ChartJsDonutCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = data.map((d) => d.color);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgb(38 38 38)",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: { label?: string; raw?: unknown }) =>
            `${ctx.label ?? ""}: ${ctx.raw ?? 0}`,
        },
      },
    },
  };

  const hasData = data.length > 0 && values.some((v) => v > 0);

  return (
    <Card className={cn("rounded-xl", className)}>
      <CardHeader className="p-4 md:p-6 pb-2">
        <CardTitle className="text-sm md:text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-4 md:p-6 pt-2">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          {!mounted ? (
            <div
              className="flex items-center justify-center text-neutral-400 text-sm bg-neutral-50 rounded-full"
              style={{ width: size, height: size }}
              aria-hidden
            >
              Loading…
            </div>
          ) : hasData ? (
            <>
              <Doughnut data={chartData} options={options} />
              {(centerLabel != null || centerValue != null) && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  aria-hidden
                >
                  {centerValue != null && (
                    <span className="text-2xl font-bold text-neutral-900">
                      {centerValue}
                    </span>
                  )}
                  {centerLabel != null && (
                    <span className="text-xs text-neutral-500">{centerLabel}</span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div
              className="flex items-center justify-center text-neutral-500 text-sm"
              style={{ width: size, height: size }}
            >
              No data
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-neutral-600">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
