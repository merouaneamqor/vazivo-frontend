"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export function ChartCard({ title, data, height = 200, className }: ChartCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={data} height={height} showLabels showValues />
      </CardContent>
    </Card>
  );
}
