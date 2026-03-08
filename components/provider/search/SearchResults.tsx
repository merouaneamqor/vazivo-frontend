"use client";

import { Calendar, User, Briefcase, Users, Building2, Star, Command } from "lucide-react";
import { cn, getBusinessCityDisplay, getBusinessCategoryDisplay } from "@/lib/utils";
import type {
  SearchBooking,
  SearchCustomer,
  SearchService,
  SearchStaff,
  SearchBusiness,
  SearchReview,
  SearchShortcut,
} from "@/types/provider-search";

interface ResultItemProps {
  isSelected: boolean;
  onClick: () => void;
}

export function BookingResult({ booking, isSelected, onClick }: { booking: SearchBooking } & ResultItemProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    no_show: "bg-neutral-100 text-neutral-700",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
        <Calendar className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-neutral-900">#{booking.booking_number}</span>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColors[booking.status])}>
            {booking.status}
          </span>
        </div>
        <div className="text-xs text-neutral-500 mt-0.5">
          {booking.service_name} · {booking.customer_name}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">
          {booking.business_name} · {new Date(booking.start_time).toLocaleString()}
        </div>
      </div>
      <div className="text-sm font-medium text-neutral-700">{booking.price} MAD</div>
    </button>
  );
}

export function CustomerResult({ customer, isSelected, onClick }: { customer: SearchCustomer } & ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
        <User className="h-4 w-4 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900">{customer.name}</div>
        <div className="text-xs text-neutral-500 mt-0.5">
          {customer.phone} · {customer.total_bookings} bookings
        </div>
      </div>
    </button>
  );
}

export function ServiceResult({ service, isSelected, onClick }: { service: SearchService } & ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
        <Briefcase className="h-4 w-4 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900">{service.name}</div>
        <div className="text-xs text-neutral-500 mt-0.5">
          {service.duration} min · {service.category}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">{service.business_name}</div>
      </div>
      <div className="text-sm font-medium text-neutral-700">{service.price} MAD</div>
    </button>
  );
}

export function StaffResult({ staff, isSelected, onClick }: { staff: SearchStaff } & ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
        <Users className="h-4 w-4 text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900">{staff.name}</div>
        <div className="text-xs text-neutral-500 mt-0.5">
          {staff.role} {staff.available_today && "· Available today"}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">{staff.business_name}</div>
      </div>
    </button>
  );
}

export function BusinessResult({ business, isSelected, onClick }: { business: SearchBusiness } & ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
        <Building2 className="h-4 w-4 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900">{business.name}</div>
        <div className="text-xs text-neutral-500 mt-0.5">
          {getBusinessCityDisplay(business.city)} · {getBusinessCategoryDisplay(business.category)}
        </div>
      </div>
      <div
        className={cn(
          "px-2 py-0.5 rounded text-xs font-medium",
          business.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        )}
      >
        {business.status}
      </div>
    </button>
  );
}

export function ReviewResult({ review, isSelected, onClick }: { review: SearchReview } & ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
        <Star className="h-4 w-4 text-yellow-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-neutral-900">{review.customer_name}</span>
          <span className="text-xs text-yellow-600">{"★".repeat(review.rating)}</span>
        </div>
        <div className="text-xs text-neutral-500 mt-0.5 truncate">{review.comment}</div>
        <div className="text-xs text-neutral-400 mt-0.5">{review.business_name}</div>
      </div>
    </button>
  );
}

export function ShortcutResult({ shortcut, isSelected, onClick }: { shortcut: SearchShortcut } & ResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
        <Command className="h-4 w-4 text-neutral-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-neutral-900">{shortcut.label}</div>
        <div className="text-xs text-neutral-500 mt-0.5">{shortcut.category}</div>
      </div>
    </button>
  );
}
