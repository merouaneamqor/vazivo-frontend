import type { OpeningHours, OpeningHoursMulti, OpeningHoursDay, OpeningHoursInterval, OpeningHoursPayload } from "@/types";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

/**
 * Normalize API/payload to OpeningHoursMulti (array per day).
 * Handles legacy { open, close } per day or already array format.
 */
export function toOpeningHoursMulti(payload: OpeningHoursPayload | null | undefined): OpeningHoursMulti {
  const result: OpeningHoursMulti = {};
  for (const day of DAYS) {
    const raw = payload?.[day];
    if (!raw) {
      result[day] = [];
      continue;
    }
    if (Array.isArray(raw)) {
      result[day] = raw
        .filter((h): h is OpeningHoursInterval => !!h && typeof h.open === "string" && typeof h.close === "string")
        .map((h) => ({ open: h.open.trim(), close: h.close.trim() }))
        .filter((h) => h.open && h.close);
      continue;
    }
    const open = raw.open != null ? String(raw.open).trim() : "";
    const close = raw.close != null ? String(raw.close).trim() : "";
    result[day] = open && close ? [{ open, close }] : [];
  }
  return result;
}

/**
 * Convert OpeningHoursMulti to payload for API (array per day).
 * Backend accepts this format.
 */
export function openingHoursMultiToPayload(multi: OpeningHoursMulti): Record<string, OpeningHoursDay> {
  const result: Record<string, OpeningHoursDay> = {};
  for (const day of DAYS) {
    const intervals = multi[day];
    result[day] = Array.isArray(intervals)
      ? intervals.filter((h) => h.open && h.close).map((h) => ({ open: h.open, close: h.close }))
      : [];
  }
  return result;
}

/**
 * Legacy format: one interval per day (for APIs that only accept legacy).
 * Uses first interval of each day.
 */
function openingHoursMultiToLegacy(multi: OpeningHoursMulti): OpeningHours {
  const result: OpeningHours = {};
  for (const day of DAYS) {
    const intervals = multi[day];
    const first = Array.isArray(intervals) && intervals.length > 0 ? intervals[0] : null;
    result[day] = first ? { open: first.open, close: first.close } : { open: null, close: null };
  }
  return result;
}

export function getDefaultOpeningHoursMulti(): OpeningHoursMulti {
  return toOpeningHoursMulti({
    monday: { open: "09:00", close: "19:00" },
    tuesday: { open: "09:00", close: "19:00" },
    wednesday: { open: "09:00", close: "19:00" },
    thursday: { open: "09:00", close: "19:00" },
    friday: { open: "09:00", close: "19:00" },
    saturday: { open: "10:00", close: "18:00" },
    sunday: { open: null, close: null },
  });
}

export { DAYS };
