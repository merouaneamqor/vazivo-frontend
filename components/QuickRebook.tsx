"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { RefreshCw, Clock, ArrowRight, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn, toServiceSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types";

interface QuickRebookProps {
  bookings: Booking[];
  title?: string;
  showViewAll?: boolean;
  maxItems?: number;
  className?: string;
}

export function QuickRebook({
  bookings,
  title = "Book Again",
  showViewAll = true,
  maxItems = 3,
  className,
}: QuickRebookProps) {
  // Filter to only completed bookings and remove duplicates by service
  const uniqueBookings = React.useMemo(() => {
    const seen = new Set<number>();
    return bookings
      .filter((b) => b.status === "completed")
      .filter((b) => {
        if (seen.has(b.service_id)) return false;
        seen.add(b.service_id);
        return true;
      })
      .slice(0, maxItems);
  }, [bookings, maxItems]);

  if (uniqueBookings.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold text-neutral-900">{title}</h3>
        </div>
        {showViewAll && (
          <Link href="/bookings?filter=past">
            <Button variant="ghost" size="sm" className="text-primary-600">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {uniqueBookings.map((booking, index) => (
          <QuickRebookCard key={booking.id} booking={booking} index={index} />
        ))}
      </div>
    </div>
  );
}

interface QuickRebookCardProps {
  booking: Booking;
  index: number;
}

function QuickRebookCard({ booking, index }: QuickRebookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex-shrink-0"
    >
      <Link href={booking.business_slug ? `/book/${booking.business_slug}/${toServiceSlug(booking.service_name)}` : "/bookings"}>
        <div className="w-[200px] bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-primary-200 hover:shadow-soft transition-all">
          {/* Service info */}
          <div className="p-3">
            <p className="font-medium text-neutral-900 line-clamp-1">
              {booking.service_name}
            </p>
            <p className="text-sm text-neutral-500 line-clamp-1">
              {booking.business_name}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
              <Calendar className="h-3 w-3" />
              <span>Last: {format(parseISO(booking.date), "MMM d")}</span>
            </div>
          </div>

          {/* Quick book button */}
          <div className="px-3 pb-3">
            <Button size="sm" className="w-full">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Book Again
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Inline variant for dashboard
interface InlineRebookProps {
  booking: Booking;
  className?: string;
}

export function InlineRebook({ booking, className }: InlineRebookProps) {
  return (
    <Link href={booking.business_slug ? `/book/${booking.business_slug}/${toServiceSlug(booking.service_name)}` : "/bookings"}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 p-3 bg-primary-50 ",
          "border border-primary-100 hover:border-primary-200 transition-colors",
          className
        )}
      >
        <div className="p-2 bg-white rounded-lg">
          <RefreshCw className="h-4 w-4 text-primary-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 text-sm line-clamp-1">
            {booking.service_name}
          </p>
          <p className="text-xs text-neutral-500">at {booking.business_name}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary-400" />
      </motion.div>
    </Link>
  );
}
