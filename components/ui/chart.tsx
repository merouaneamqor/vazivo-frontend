"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Simple bar chart with animations
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  showLabels = true,
  showValues = true,
  className,
}: BarChartProps) {
  if (!data?.length) return <div className={cn("flex items-center justify-center text-neutral-500 text-sm", className)} style={{ height }}>No data</div>;
  const maxValue = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            {showValues && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                className="text-xs font-medium text-neutral-600"
              >
                {item.value}
              </motion.span>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${barHeight}%` }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
              className={cn(
                "w-full rounded-t-lg",
                item.color || "bg-primary-500"
              )}
              style={{ minHeight: item.value > 0 ? 4 : 0 }}
            />
            {showLabels && (
              <span className="text-xs text-neutral-500 truncate max-w-full">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Line sparkline chart
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "#8b5cf6",
  showDot = true,
  className,
}: SparklineProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const lastPoint = data[data.length - 1];
  const lastX = width;
  const lastY = height - ((lastPoint - minValue) / range) * height;

  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)}>
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {showDot && (
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, duration: 0.2 }}
          cx={lastX}
          cy={lastY}
          r={4}
          fill={color}
        />
      )}
    </svg>
  );
}

// Donut/Pie chart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

export function DonutChart({
  data,
  size = 120,
  strokeWidth = 16,
  showLabel = true,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {data.map((item, index) => {
          const percentage = total > 0 ? item.value / total : 0;
          const strokeDasharray = circumference * percentage;
          const strokeDashoffset = -currentOffset;
          currentOffset += strokeDasharray;

          return (
            <motion.circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            />
          );
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-neutral-900"
            >
              {centerValue}
            </motion.span>
          )}
          {centerLabel && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-neutral-500"
            >
              {centerLabel}
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
}

// Progress ring
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = "#8b5cf6",
  bgColor = "#e7e5e4",
  showValue = true,
  label,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-bold text-neutral-900"
          >
            {Math.round(percentage * 100)}%
          </motion.span>
          {label && (
            <span className="text-[10px] text-neutral-500">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Stat card with trend
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  trend,
  sparklineData,
  icon,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white  p-5 border border-neutral-100",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-neutral-500">{title}</span>
        {icon && (
          <div className="p-2 bg-neutral-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success-600" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            color={trend?.isPositive ? "#22c55e" : "#ef4444"}
            width={80}
            height={30}
          />
        )}
      </div>
    </motion.div>
  );
}
