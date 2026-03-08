"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  Star,
  Tag,
  Check,
  X,
  ChevronRight,
  Clock,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SwipeActionRow } from "@/components/ui/swipe-action";

interface Notification {
  id: string;
  type: "booking" | "reminder" | "review" | "promo";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

const typeConfig = {
  booking: { icon: Calendar, color: "text-primary-500", bgColor: "bg-primary-100" },
  reminder: { icon: Clock, color: "text-amber-500", bgColor: "bg-amber-100" },
  review: { icon: Star, color: "text-amber-500", bgColor: "bg-amber-100" },
  promo: { icon: Tag, color: "text-rose-500", bgColor: "bg-rose-100" },
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  className,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn("bg-white rounded-2xl shadow-soft-lg border border-neutral-100", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-neutral-400">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="h-12 w-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-500">No notifications yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                onMarkAsRead={() => onMarkAsRead(notification.id)}
                onDelete={() => onDelete(notification.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

function NotificationItem({
  notification,
  index,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const config = typeConfig[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <SwipeActionRow
        rightActions={[
          {
            icon: <Trash2 className="h-5 w-5" />,
            label: "Delete",
            color: "text-white",
            bgColor: "bg-red-500",
            onAction: onDelete,
          },
        ]}
        leftActions={
          !notification.read
            ? [
                {
                  icon: <Check className="h-5 w-5" />,
                  label: "Read",
                  color: "text-white",
                  bgColor: "bg-success-500",
                  onAction: onMarkAsRead,
                },
              ]
            : []
        }
      >
        <div
          className={cn(
            "flex gap-3 p-4 border-b border-neutral-50 transition-colors",
            !notification.read && "bg-primary-50/50"
          )}
          onClick={onMarkAsRead}
        >
          <div className={cn("p-2  flex-shrink-0", config.bgColor)}>
            <config.icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className={cn(
                  "text-sm line-clamp-1",
                  notification.read ? "text-neutral-700" : "font-medium text-neutral-900"
                )}
              >
                {notification.title}
              </p>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
            <p className="text-sm text-neutral-500 line-clamp-2 mt-0.5">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-400">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
              {notification.action && (
                <a
                  href={notification.action.href}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center"
                >
                  {notification.action.label}
                  <ChevronRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </SwipeActionRow>
    </motion.div>
  );
}

// Notification Bell with Badge
interface NotificationBellProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBell({ count, onClick, className }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2  hover:bg-neutral-100 transition-colors",
        className
      )}
    >
      <Bell className="h-5 w-5 text-neutral-600" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </button>
  );
}
