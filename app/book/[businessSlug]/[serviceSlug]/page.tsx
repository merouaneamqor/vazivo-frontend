"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, AlertCircle, Clock, Calendar as CalendarIcon, User, Phone, Mail } from "lucide-react";
import { format, addDays } from "date-fns";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking, usePublicServiceAvailability } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { PageSpinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatPrice, formatDuration, formatTime, toServiceSlug } from "@/lib/utils";
import type { Business, Service } from "@/types";

const STEPS = ["date", "time", "details", "confirm"] as const;

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.businessSlug as string;
  const serviceSlug = params.serviceSlug as string;
  const { isAuthenticated, user } = useAuth();
  const createBooking = useCreateBooking();

  const [step, setStep] = useState<(typeof STEPS)[number]>("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { data: businessData, isLoading: businessLoading, error: businessError } = useQuery({
    queryKey: queryKeys.businesses.detail(businessSlug),
    queryFn: () => api.getBusiness(businessSlug),
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["public", "businesses", businessSlug, "services"],
    queryFn: () => api.getPublicBusinessServices(businessSlug),
    enabled: !!businessSlug,
  });

  const business = businessData?.business;
  const services = servicesData?.services ?? [];
  const service = services.find(
    (s: Service) => (typeof s.slug === "string" && s.slug ? s.slug : toServiceSlug(s.name)) === serviceSlug
  );

  const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const { data: availabilityData, isLoading: availabilityLoading } = usePublicServiceAvailability(
    service?.id ?? 0,
    dateString
  );
  const slots = (availabilityData?.slots ?? []).filter((s) => s.available);

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name ?? "");
      setCustomerPhone(user.phone ?? "");
      setCustomerEmail(user.email ?? "");
    }
  }, [isAuthenticated, user]);

  const isLoading = businessLoading || (business && servicesLoading);
  const canProceedTime = step === "time" && selectedTime;
  const canProceedDetails =
    step === "details" &&
    customerName.trim() &&
    customerPhone.trim() &&
    customerEmail.trim();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <PageSpinner />
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">Business not found</h1>
          <p className="text-neutral-600 text-sm mb-6">The business you're looking for doesn't exist.</p>
          <Link href="/search">
            <Button variant="outline">Find services</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">Service not found</h1>
          <p className="text-neutral-600 text-sm mb-6">This service is no longer available.</p>
          <Link href={`/business/${business.slug}`}>
            <Button variant="outline">View other services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    setSubmitError("");
    if (!selectedDate || !selectedTime) return;
    createBooking.mutate(
      {
        service_id: service.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedTime,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
      },
      {
        onSuccess: (data: unknown) => {
          const res = data as { booking?: { short_booking_id?: string }; short_booking_id?: string };
          const shortId = res?.booking?.short_booking_id ?? res?.short_booking_id;
          if (shortId && typeof window !== "undefined") {
            window.location.href = `/book/confirmed/${shortId}`;
          } else {
            router.push("/bookings");
          }
        },
        onError: () => {
          setSubmitError("Something went wrong. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/business/${business.slug}`} className="p-1 -ml-1 rounded-lg hover:bg-neutral-100">
            <ChevronLeft className="h-6 w-6 text-neutral-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-neutral-900 truncate">{service.name}</h1>
            <p className="text-sm text-neutral-500 truncate">{business.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full",
                STEPS.indexOf(step) >= i ? "bg-primary-500" : "bg-neutral-200"
              )}
            />
          ))}
        </div>

        {step === "date" && (
          <>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary-600">Step 1 of 4</p>
                <h2 className="mt-1 text-xl font-semibold text-neutral-900">When would you like to come?</h2>
                <p className="mt-1 text-sm text-neutral-500">Pick a date to see available time slots.</p>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-5">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-xl w-full"
                />
              </div>
              {selectedDate && (
                <p className="text-sm text-neutral-600 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary-500 shrink-0" />
                  <span className="font-medium text-neutral-900">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </p>
              )}
            </div>
            <Button
              className="w-full rounded-xl h-12 text-base font-medium shadow-sm"
              size="lg"
              onClick={() => setStep("time")}
              disabled={!selectedDate}
            >
              Next: Choose time
            </Button>
          </>
        )}

        {step === "time" && (
          <>
            <div>
              <Label className="text-base font-medium">Choose time</Label>
              <p className="text-sm text-neutral-500 mt-1">{selectedDate && format(selectedDate, "EEEE, MMM d")}</p>
              {availabilityLoading ? (
                <p className="text-neutral-500 py-4">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-neutral-500 py-4">No slots available this day. Pick another date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={cn(
                        "py-2.5 rounded-xl border text-sm font-medium transition-colors",
                        selectedTime === slot.time
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      )}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("date")}>
                Back
              </Button>
              <Button className="flex-1" size="lg" onClick={() => setStep("details")} disabled={!canProceedTime}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <div className="space-y-4">
              <Label className="text-base font-medium">Your details</Label>
              <div>
                <Label htmlFor="name" className="text-neutral-600">Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-neutral-600">Phone</Label>
                <PhoneInput
                  id="phone"
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-neutral-600">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("time")}>
                Back
              </Button>
              <Button className="flex-1" size="lg" onClick={() => setStep("confirm")} disabled={!canProceedDetails}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
              <p className="font-medium text-neutral-900">{service.name}</p>
              <p className="text-sm text-neutral-600 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {selectedDate && format(selectedDate, "EEEE, MMMM d")}
              </p>
              <p className="text-sm text-neutral-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {selectedTime && formatTime(selectedTime)} · {formatDuration(service.duration)}
              </p>
              <p className="text-sm text-neutral-600">{formatPrice(service.price)}</p>
              <p className="text-sm text-neutral-700 pt-2 border-t border-neutral-100">
                {customerName} · {customerPhone} · {customerEmail}
              </p>
            </div>
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                Back
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleSubmit}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "Confirming…" : "Confirm booking"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
