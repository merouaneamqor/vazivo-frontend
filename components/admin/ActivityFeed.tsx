"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star } from "lucide-react";
import type { AdminActivityItem } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  bookings: AdminActivityItem[];
  reviews: AdminActivityItem[];
  className?: string;
}

export function ActivityFeed({ bookings, reviews, className }: ActivityFeedProps) {
  const combined = [
    ...bookings.map((b) => ({ ...b, _sort: new Date(b.created_at).getTime() })),
    ...reviews.map((r) => ({ ...r, _sort: new Date(r.created_at).getTime() })),
  ]
    .sort((a, b) => b._sort - a._sort)
    .slice(0, 15);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {combined.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className="flex items-start gap-3 text-sm"
            >
              <div
                className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  item.type === "booking" ? "bg-primary-50" : "bg-accent-50"
                )}
              >
                {item.type === "booking" ? (
                  <Calendar className="h-4 w-4 text-primary-600" />
                ) : (
                  <Star className="h-4 w-4 text-accent-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900">
                  {item.type === "booking"
                    ? `${item.customer_name || "Customer"} booked ${item.service_name} at ${item.business_name}`
                    : `${item.user_name} left ${item.rating}★ for ${item.business_name}`}
                </p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
