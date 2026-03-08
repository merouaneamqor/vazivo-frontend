"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Star,
  Settings,
  Clock,
  ChevronRight,
  X,
  RefreshCw,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import { useCancelBooking } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { StatusBadge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedTabs } from "@/components/ui/tabs";
import { InteractiveRating, RatingStars } from "@/components/ui/rating-stars";
import { BookingCardSkeleton } from "@/components/ui/skeleton";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";
import { formatPrice, formatTime, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Booking } from "@/types";
import type { User as UserType } from "@/types";

type DashboardTab = "upcoming" | "past" | "reviews" | "settings";

const TAB_IDS: DashboardTab[] = ["upcoming", "past", "reviews", "settings"];

function parseTabParam(tab: string | null): DashboardTab | null {
  if (!tab) return null;
  return TAB_IDS.includes(tab as DashboardTab) ? (tab as DashboardTab) : null;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = useMemo(() => parseTabParam(searchParams.get("tab")), [searchParams]);
  const { user, isAuthenticated, isLoading: authLoading, updatePassword, isUpdatingPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("upcoming");

  // Sync URL ?tab= to active tab on mount and when param changes
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) return <PageSpinner />;

  const tabs = [
    { id: "upcoming" as const, label: "Upcoming", icon: <Calendar className="h-4 w-4" /> },
    { id: "past" as const, label: "Past", icon: <Clock className="h-4 w-4" /> },
    { id: "reviews" as const, label: "My Reviews", icon: <Star className="h-4 w-4" /> },
    { id: "settings" as const, label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  const isCustomer = user?.role === "customer";

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar_url} alt={user?.name || "User avatar"} />
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                {getInitials(user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                {user?.name}
              </h1>
              <p className="text-neutral-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Upgrade to Provider CTA (only for customers) */}
        {isCustomer && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    Own a business?
                  </h3>
                  <p className="text-sm text-neutral-600">
                    List your restaurant on Vazivo and reach thousands of diners.
                  </p>
                </div>
                <Button onClick={() => router.push('/upgrade-to-provider')} className="shrink-0">
                  Become a Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as DashboardTab)}
            variant="pills"
          />
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "upcoming" && <UpcomingBookings />}
          {activeTab === "past" && <PastBookings />}
          {activeTab === "reviews" && <MyReviews />}
          {activeTab === "settings" && (
            <AccountSettings
              user={user}
              onUpdatePassword={updatePassword}
              isUpdatingPassword={isUpdatingPassword}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function UpcomingBookings() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.list({ upcoming: true }),
    queryFn: () => api.getBookings({ upcoming: true }),
  });

  const cancelBooking = useCancelBooking();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-500">Failed to load bookings</p>
        </CardContent>
      </Card>
    );
  }

  // Handle various API response formats
  const bookings: Booking[] = Array.isArray(data) 
    ? data 
    : Array.isArray(data?.bookings) 
      ? data.bookings 
      : [];

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-semibold text-neutral-900 mb-2">No upcoming bookings</h3>
          <p className="text-neutral-500 mb-6">
            Ready to book your next appointment?
          </p>
          <Link href="/search">
            <Button>Browse Services</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={() => cancelBooking.mutate(booking.id)}
          isCancelling={cancelBooking.isPending}
        />
      ))}
    </div>
  );
}

function PastBookings() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.list({ past: true }),
    queryFn: () => api.getBookings({ past: true }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-500">Failed to load bookings</p>
        </CardContent>
      </Card>
    );
  }

  // Handle various API response formats
  const bookings: Booking[] = Array.isArray(data) 
    ? data 
    : Array.isArray(data?.bookings) 
      ? data.bookings 
      : [];

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-semibold text-neutral-900 mb-2">No past bookings</h3>
          <p className="text-neutral-500">
            Your completed appointments will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
  isCancelling?: boolean;
}

function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  const bookingDate = parseISO(booking.date);
  const isUpcoming = isAfter(bookingDate, new Date());

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Date Column */}
          <div className="bg-primary-50 p-4 md:p-6 flex md:flex-col items-center justify-center md:w-28 gap-2 md:gap-0">
            <span className="text-sm text-primary-600 font-medium">
              {format(bookingDate, "EEE")}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-primary-700">
              {format(bookingDate, "d")}
            </span>
            <span className="text-sm text-primary-600">{format(bookingDate, "MMM")}</span>
          </div>

          {/* Details Column */}
          <div className="flex-1 p-4 md:p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">
                  {booking.service_name}
                </h3>
                <Link
                  href={`/business/${booking.business_slug || booking.business_id}`}
                  className="text-neutral-500 hover:text-primary-600 flex items-center text-sm"
                >
                  {booking.business_name}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-neutral-400" />
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </span>
              {booking.total_price && (
                <span className="font-medium text-neutral-900">
                  {formatPrice(booking.total_price)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {booking.can_cancel && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}

              {booking.status === "completed" && !booking.review && (
                <Link href={`/bookings/${booking.id}/review`}>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </Link>
              )}

              {isUpcoming && (
                <Link href={`/business/${booking.business_slug || booking.business_id}`}>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reschedule
                  </Button>
                </Link>
              )}

              <Link href={`/bookings/${booking.id}`}>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MyReviews() {
  // Note: This would need a dedicated API endpoint for user reviews
  // For now, we will show a placeholder
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Star className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="font-semibold text-neutral-900 mb-2">Your reviews</h3>
        <p className="text-neutral-500">
          Reviews you have left for businesses will appear here
        </p>
      </CardContent>
    </Card>
  );
}

const ROLE_BADGE_VARIANTS = {
  customer: "default",
  provider: "secondary",
  admin: "destructive",
} as const;

interface AccountSettingsProps {
  user: (Pick<UserType, "name" | "email" | "phone" | "role"> & { avatar_url?: string }) | null;
  onUpdatePassword: (
    data: { currentPassword: string; newPassword: string },
    options?: { onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => void;
  isUpdatingPassword: boolean;
}

function AccountSettings({ user, onUpdatePassword, isUpdatingPassword }: AccountSettingsProps) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    onUpdatePassword(
      {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setPasswordError("");
          setPasswordSuccess(true);
        },
        onError: () => {
          setPasswordError("Update failed. Check your current password and try again.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-neutral-400" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information and account type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={user?.avatar_url} alt={user?.name} />
              <AvatarFallback className="text-2xl bg-primary-100 text-primary-700">
                {getInitials(user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-0.5">Name</label>
                <p className="text-neutral-900 font-medium">{user?.name ?? "—"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-0.5">Email</label>
                <p className="text-neutral-900 flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                  {user?.email ?? "—"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-0.5">Phone</label>
                <p className="text-neutral-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                  {user?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-0.5">Account type</label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-neutral-400 shrink-0" />
                  <Badge variant={ROLE_BADGE_VARIANTS[user?.role ?? "customer"]}>
                    {user?.role?.replace("_", " ") ?? "—"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-neutral-400" />
            Language
          </CardTitle>
          <CardDescription>Preferred language for the app. Saved to your account when signed in.</CardDescription>
        </CardHeader>
        <CardContent>
          <LocaleSwitcher />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-neutral-400" />
            Change password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Current password
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                New password
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Confirm new password
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                required
                error={passwordError}
              />
            </div>
            {passwordSuccess && (
              <p className="text-sm text-success-600">Password updated successfully.</p>
            )}
            <Button type="submit" loading={isUpdatingPassword} disabled={isUpdatingPassword}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-neutral-200 border-red-200/50 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-neutral-900">Delete account</p>
              <p className="text-sm text-neutral-600">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="shrink-0" disabled>
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
