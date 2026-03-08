/**
 * Calendar Feature — Type Definitions
 * @module src/features/calendar/types
 */

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;      // ISO-8601
  end: string;        // ISO-8601
  allDay?: boolean;
  bookingId?: number;
  status?: "pending" | "confirmed" | "cancelled";
  color?: string;
}

export interface CalendarViewConfig {
  view: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
  initialDate: string;
}
