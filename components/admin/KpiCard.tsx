import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden rounded-xl", className)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-neutral-500 truncate">{title}</p>
            <p className="text-lg md:text-xl font-display font-bold text-neutral-900 mt-0.5">{value}</p>
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary-600" />
            </div>
          )}
        </div>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium mt-1.5",
              trend === "up" && "text-success-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-neutral-500"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"} vs last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
