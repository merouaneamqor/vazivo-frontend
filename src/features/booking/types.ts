/**
 * Booking Feature — Type Definitions
 * @module src/features/booking/types
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Booking {
  id: number;
  shortId: string;
  serviceId: number;
  serviceName: string;
  businessId: number;
  businessName: string;
  customerId: number;
  customerName: string;
  startsAt: string;       // ISO-8601
  endsAt: string;         // ISO-8601
  durationMinutes: number;
  price: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface BookingSlot {
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  available: boolean;
}

export interface CreateBookingPayload {
  serviceId: number;
  date: string;
  startTime: string;
  notes?: string;
}
