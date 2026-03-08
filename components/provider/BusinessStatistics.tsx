"use client";

import { useQuery } from "@tanstack/react-query";
import { Phone, Eye, Calendar, MapPin, Navigation } from "lucide-react";

interface BusinessStatistics {
  phone_clicks: number;
  profile_views: number;
  booking_clicks: number;
  google_maps_clicks: number;
  waze_clicks: number;
  updated_at: string;
}

export default function BusinessStatistics({ businessId }: { businessId: number }) {
  const { data: stats } = useQuery<BusinessStatistics>({
    queryKey: ["business-statistics", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/provider/statistics/${businessId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return res.json();
    },
  });

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Phone Leads</p>
            <p className="text-2xl font-semibold text-neutral-900">{stats.phone_clicks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Eye className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Profile Views</p>
            <p className="text-2xl font-semibold text-neutral-900">{stats.profile_views}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Booking Clicks</p>
            <p className="text-2xl font-semibold text-neutral-900">{stats.booking_clicks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 rounded-lg">
            <MapPin className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Google Maps</p>
            <p className="text-2xl font-semibold text-neutral-900">{stats.google_maps_clicks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-50 rounded-lg">
            <Navigation className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Waze</p>
            <p className="text-2xl font-semibold text-neutral-900">{stats.waze_clicks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
