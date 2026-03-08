/**
 * Booking Feature — Public API
 *
 * This is the only file other features and app/ pages should import from.
 * Implementation details (individual component files, internal hooks) are
 * not part of the public API and should not be imported directly.
 *
 * @module src/features/booking
 */

// Types
export type {
  Booking,
  BookingSlot,
  BookingStatus,
  CreateBookingPayload,
} from "./types";

// Flags (re-exported for convenience — booking pages may import from here)
export { newBookingFlowFlag, quickRebookFlag } from "./flags";

// Hooks
export { useBookings } from "./hooks";

// API client
export { bookingApi } from "./api";

// Components
export { QuickRebook } from "@/components/QuickRebook";
