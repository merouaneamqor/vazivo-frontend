"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, ExternalLink, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Business } from "@/types";

const SearchMapView = dynamic(() => import("@/components/SearchMapView"), { ssr: false });

interface MapPreviewProps {
  address: string;
  city?: string;
  mapUrl: string | null;
  /** When provided with lat/lng, embeds the same Leaflet map as the search page */
  business?: Business | null;
  className?: string;
}

export function MapPreview({ address, city, mapUrl, business, className }: MapPreviewProps) {
  const fullAddress = city ? `${address}, ${city}` : address;
  const hasMap = business?.lat != null && business?.lng != null;
  const wazeUrl = hasMap ? `https://waze.com/ul?ll=${business.lat},${business.lng}&navigate=yes` : null;
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50 border border-neutral-100">
            <MapPin className="h-5 w-5 text-neutral-500" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground font-medium leading-snug">
              {fullAddress}
            </p>
            {(mapUrl || wazeUrl) && (
              <div className="relative mt-2">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Show map
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                </button>
                {showDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-10">
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Google Maps
                      </a>
                    )}
                    {wazeUrl && (
                      <a
                        href={wazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Waze
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {mounted && hasMap && business && (
          <div className="mt-4 w-full aspect-[4/3] rounded-lg overflow-hidden border border-neutral-100">
            <SearchMapView
              businesses={[business]}
              selectedBusiness={business}
              className="w-full h-full"
              hideLegend
            />
          </div>
        )}
        {mapUrl && !hasMap && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex aspect-[2.4/1] w-full items-center justify-center rounded-lg bg-neutral-100 border border-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
            aria-label="Open map"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              View on Google Maps
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
