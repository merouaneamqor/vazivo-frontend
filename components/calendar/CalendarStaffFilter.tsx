"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StaffMember } from "@/types";

export const STAFF_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
  "#f97316",
  "#f43f5e",
  "#10b981",
  "#eab308",
  "#ec4899",
];

interface CalendarStaffFilterProps {
  staffMembers: StaffMember[];
  selectedStaffId: number | null;
  onChange: (id: number | null) => void;
  variant: "dropdown" | "drawer-list";
  staffColors?: string[];
}

export function CalendarStaffFilter({
  staffMembers,
  selectedStaffId,
  onChange,
  variant,
  staffColors = STAFF_COLORS,
}: CalendarStaffFilterProps) {
  const t = useTranslations("calendar");
  const allStaffLabel = t("allStaff") ?? "All staff";

  if (variant === "dropdown") {
    return (
      <Select
        value={selectedStaffId != null ? String(selectedStaffId) : "all"}
        onValueChange={(v) => onChange(v === "all" ? null : Number(v))}
      >
        <SelectTrigger className="w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
          <SelectValue placeholder={t("staff")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allStaffLabel}</SelectItem>
          {staffMembers.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{t("staff")}</h3>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`w-full flex items-center gap-2 p-2 rounded-lg ${
            selectedStaffId === null ? "bg-primary-50" : "hover:bg-neutral-100"
          }`}
        >
          <span className="text-sm flex-1 text-left">{allStaffLabel}</span>
        </button>
        {staffMembers.map((staff, index) => {
          const color = staffColors[index % staffColors.length];
          const isSelected = selectedStaffId === staff.id;
          return (
            <button
              key={staff.id}
              type="button"
              onClick={() => onChange(staff.id)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg ${
                isSelected ? "bg-primary-50" : "hover:bg-neutral-100"
              }`}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm flex-1 text-left">{staff.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
