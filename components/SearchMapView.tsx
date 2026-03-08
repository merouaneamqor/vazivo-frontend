"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { getBusinessPath } from "@/lib/utils";
import type { Business } from "@/types";
import "leaflet/dist/leaflet.css";

// Leaflet uses window; this component is loaded only on client via next/dynamic(..., { ssr: false }) in SearchPageContent
let L: typeof import("leaflet");

if (typeof window !== "undefined") {
  L = require("leaflet");
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), {
  ssr: false,
});

// Fly to user location when it is set (e.g. after geolocation returns).
// Skipped when cityCenter is set so the map stays on the searched city and doesn't fight MapCenterHandler.
function createUserLocationHandler() {
  return function UserLocationHandler({
    userLocation,
    skip,
  }: {
    userLocation?: { lat: number; lng: number } | null;
    skip?: boolean;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMap } = require("react-leaflet");
    const map = useMap();

    useEffect(() => {
      if (skip || userLocation?.lat == null || userLocation?.lng == null) return;
      map.setView([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 0.5,
      });
    }, [skip, userLocation, map]);

    return null;
  };
}

const UserLocationHandler = createUserLocationHandler();

// Component to handle Ctrl+scroll zoom
function createScrollZoomHandler() {
  return function ScrollZoomHandler() {
    const { useMap } = require("react-leaflet");
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      // Disable default scroll wheel zoom
      map.scrollWheelZoom.disable();

      // Add custom handler
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY;
          if (delta < 0) {
            map.zoomIn();
          } else {
            map.zoomOut();
          }
        }
      };

      const container = map.getContainer();
      if (!container) return;

      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }, [map]);

    return null;
  };
}

const ScrollZoomHandler = createScrollZoomHandler();

// Component to track map bounds changes and notify parent
function createMapBoundsTracker() {
  return function MapBoundsTracker({
    onBoundsChange,
    isProgrammaticMove,
  }: {
    onBoundsChange?: (center: { lat: number; lng: number }, radius: number) => void;
    isProgrammaticMove?: boolean;
  }) {
    return null;
  };
}

const MapBoundsTracker = createMapBoundsTracker();

interface SearchMapViewProps {
  businesses: Business[];
  selectedBusiness?: Business | null;
  hoveredBusiness?: Business | null;
  onSelectBusiness?: (business: Business) => void;
  onMapBoundsChange?: (center: { lat: number; lng: number }, radius: number) => void;
  userLocation?: { lat: number; lng: number } | null;
  /** When user has selected a city, center the map on it by default */
  cityCenter?: [number, number] | null;
  className?: string;
  /** Hide the "X businesses in this area" legend (e.g. when showing a single business) */
  hideLegend?: boolean;
}

// Modern pill-shaped pin: vazivo red, white border, soft shadow. Selected = larger + ring.
function getMarkerIcon(isSelected: boolean): L.DivIcon {
  const size = isSelected ? 44 : 32;
  const border = isSelected ? 3 : 2;
  const ring = isSelected
    ? "box-shadow: 0 2px 12px rgba(0,0,0,0.15), 0 0 0 4px rgba(157,2,8,0.35);"
    : "box-shadow: 0 2px 10px rgba(0,0,0,0.12);";
  return L.divIcon({
    className: "custom-marker " + (isSelected ? "custom-marker-selected" : ""),
    html: `<div style="
      background:#9D0208;
      width:${size}px;
      height:${size}px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:${border}px solid white;
      ${ring}
      display:flex;
      align-items:center;
      justify-content:center;
    "><span style="transform:rotate(45deg);width:${size * 0.4}px;height:${size * 0.4}px;background:white;border-radius:50%;opacity:0.95;"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const MOROCCO_CENTER: [number, number] = [31.7917, -7.0926];

export default function SearchMapView({
  businesses,
  selectedBusiness,
  hoveredBusiness,
  onSelectBusiness,
  onMapBoundsChange,
  userLocation,
  cityCenter,
  className,
  hideLegend = false,
}: SearchMapViewProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter businesses with valid coordinates
  const businessesWithCoords = useMemo(() => {
    return businesses.filter((b) => b.lat != null && b.lng != null);
  }, [businesses]);

  // Map center: selected city first, then user location, then businesses, then Morocco
  const mapCenter = useMemo(() => {
    if (cityCenter?.length === 2 && !isNaN(cityCenter[0]) && !isNaN(cityCenter[1])) {
      return [cityCenter[0], cityCenter[1]] as [number, number];
    }
    if (userLocation?.lat != null && userLocation?.lng != null &&
        !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
      return [userLocation.lat, userLocation.lng] as [number, number];
    }
    if (businessesWithCoords.length === 0) {
      return MOROCCO_CENTER;
    }

    if (businessesWithCoords.length === 1) {
      const lat = businessesWithCoords[0].lat;
      const lng = businessesWithCoords[0].lng;
      if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        return [lat, lng] as [number, number];
      }
      return MOROCCO_CENTER;
    }

    const avgLat =
      businessesWithCoords.reduce((sum, b) => sum + (b.lat ?? 0), 0) / businessesWithCoords.length;
    const avgLng =
      businessesWithCoords.reduce((sum, b) => sum + (b.lng ?? 0), 0) / businessesWithCoords.length;

    if (isNaN(avgLat) || isNaN(avgLng)) {
      return MOROCCO_CENTER;
    }

    return [avgLat, avgLng] as [number, number];
  }, [cityCenter, userLocation, businessesWithCoords]);

  // Zoom: 13 for city/user, 15 for single business
  const zoomLevel = useMemo(() => {
    if (userLocation?.lat != null && userLocation?.lng != null) return 13;
    if (businessesWithCoords.length === 0) return 13;
    if (businessesWithCoords.length === 1) return 15;
    return 13;
  }, [userLocation, businessesWithCoords.length]);

  // Only mount the Leaflet map once the container is in (or near) the viewport.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInView) return;

    const node = containerRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        // Start loading a bit before it fully enters the viewport
        rootMargin: "0px 0px 200px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isInView]);

  useEffect(() => {
    // Small delay to ensure Leaflet is fully loaded
    const timer = setTimeout(() => setMapLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mapLoaded || !isInView) {
    return (
      <div ref={containerRef} className={className}>
        <div className="relative w-full h-full min-h-[320px] bg-neutral-100 overflow-hidden rounded-xl border border-neutral-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-vazivo-red border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <div className="relative w-full h-full min-h-[320px] overflow-hidden rounded-xl border border-neutral-200 shadow-md bg-white">
        {/* Ctrl+Scroll hint – at bottom so it doesn’t cover legend or result count */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-neutral-200 pointer-events-none">
          <p className="text-xs text-neutral-600 font-medium">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded-lg text-[10px] font-mono border border-neutral-200">Ctrl</kbd>
            <span className="mx-1">+</span>
            <span>scroll pour zoomer</span>
          </p>
        </div>
        
        <MapContainer
          key={cityCenter ? `city-${cityCenter[0]}-${cityCenter[1]}` : "default"}
          center={mapCenter}
          zoom={zoomLevel}
          className="w-full h-full z-0 "
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="topright" />
          <UserLocationHandler userLocation={userLocation} skip={!!cityCenter} />
          <ScrollZoomHandler />
          <MapBoundsTracker onBoundsChange={onMapBoundsChange} isProgrammaticMove={false} />
          {businessesWithCoords.map((business) => {
            const isSelected = selectedBusiness?.id === business.id;
            return (
              <Marker
                key={`${business.id}-${isSelected}`}
                position={[business.lat!, business.lng!]}
                icon={getMarkerIcon(isSelected)}
                eventHandlers={{
                  click: () => {
                    onSelectBusiness?.(business);
                  },
                }}
              >
                <Popup className="map-popup-modern">
                  <div className="map-popup-content">
                    <p className="map-popup-title">{business.name}</p>
                    {business.address && (
                      <p className="map-popup-address">{business.address}</p>
                    )}
                    {business.average_rating > 0 && (
                      <p className="map-popup-rating">
                        ★ {business.average_rating.toFixed(1)}
                        {business.total_reviews > 0 && (
                          <span> ({business.total_reviews})</span>
                        )}
                      </p>
                    )}
                    <a
                      href={getBusinessPath(business)}
                      className="map-popup-link"
                      target="_self"
                      rel="noopener noreferrer"
                    >
                      Voir l’établissement
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend – delivery-app style, matches search page */}
        {!hideLegend && businessesWithCoords.length > 0 && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-vazivo-charcoal z-[1000] shadow-lg">
            {businessesWithCoords.length} résultat{businessesWithCoords.length !== 1 ? "s" : ""} dans cette zone
          </div>
        )}
      </div>
    </div>
  );
}
