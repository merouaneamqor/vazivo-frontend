/**
 * Notifications Feature — Type Definitions
 * @module src/features/notifications/types
 */

export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_reminder"
  | "review_received"
  | "review_reply"
  | "system";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
