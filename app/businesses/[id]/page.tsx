"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBusiness } from "@/hooks/useBusinesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageSpinner } from "@/components/ui/spinner";
import { formatPrice, formatDuration, formatTime, getInitials, getBusinessCityDisplay, getBusinessCategoryDisplay } from "@/lib/utils";
import { FormattedText } from "@/components/FormattedText";
import { format, addDays, parseISO } from "date-fns";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import type { Service, Review } from "@/types";
import Link from "next/link";
import { toServiceSlug } from "@/lib/utils";

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = Number(params.id);

  const { data, isLoading, error } = useBusiness(businessId);
  const business = data?.business;

  if (isLoading) return <PageSpinner />;

  if (error || !business) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 mb-4">Failed to load business details.</p>
        <Link href="/businesses">
          <Button variant="outline">Back to Businesses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/businesses" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Businesses
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {business.image_urls && business.image_urls.length > 0 && (
            <div className="h-64 md:h-80 relative">
              <img
                src={business.image_urls[0]}
                alt={business.name}
                className="w-full h-full object-cover"
              />
              {business.is_open !== undefined && (
                <Badge
                  variant={business.is_open ? "success" : "secondary"}
                  className="absolute top-4 right-4"
                >
                  {business.is_open ? "Open Now" : "Closed"}
                </Badge>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                <Badge variant="secondary" className="mt-2">
                  {getBusinessCategoryDisplay(business.category)}
                </Badge>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(business.average_rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600">
                      {business.average_rating > 0 ? business.average_rating.toFixed(1) : "No ratings"}
                      <span className="text-gray-400"> ({business.total_reviews} reviews)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {business.address}, {getBusinessCityDisplay(business.city)}
                </div>
                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${business.phone}`} className="hover:text-primary-600">
                      {business.phone}
                    </a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${business.email}`} className="hover:text-primary-600">
                      {business.email}
                    </a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {business.description && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600">{business.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services + unified booking */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {business.services && business.services.length > 0 ? (
                <>
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            <FormattedText text={service.description} as="span" />
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(service.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold">{formatPrice(service.price)}</p>
                        {business.slug && (
                          <Link href={`/book/${business.slug}/${service.slug ?? toServiceSlug(service.name)}`}>
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-1" />
                              Book
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No services available</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({business.total_reviews})</CardTitle>
            </CardHeader>
            <CardContent>
              {business.reviews && business.reviews.length > 0 ? (
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opening Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                  (day) => {
                    const raw = business.opening_hours?.[day];
                    const intervals = Array.isArray(raw)
                      ? raw.filter((h: { open?: string; close?: string }) => h?.open && h?.close).map((h: { open: string; close: string }) => `${h.open} – ${h.close}`)
                      : raw?.open && raw?.close
                        ? [`${raw.open} – ${raw.close}`]
                        : [];
                    const isToday = format(new Date(), "EEEE").toLowerCase() === day;
                    return (
                      <div
                        key={day}
                        className={`flex justify-between text-sm ${
                          isToday ? "font-medium text-primary-600" : "text-gray-600"
                        }`}
                      >
                        <span className="capitalize">{day}</span>
                        <span>{intervals.length > 0 ? intervals.join(", ") : "Closed"}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map placeholder */}
          {business.lat && business.lng && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {business.address}, {getBusinessCityDisplay(business.city)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b pb-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(review.user_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{review.user_name}</p>
            <p className="text-xs text-gray-500">
              {format(parseISO(review.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
    </div>
  );
}
