import * as React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-700",
        secondary: "bg-neutral-100 text-neutral-700",
        success: "bg-success-100 text-success-700",
        warning: "bg-amber-100 text-amber-700",
        destructive: "bg-red-100 text-red-700",
        outline: "border border-neutral-200 text-neutral-700",
        // Category badges
        spa: "bg-lavender-100 text-lavender-700",
        salon: "bg-rose-100 text-rose-700",
        barber: "bg-teal-100 text-teal-700",
        nails: "bg-primary-100 text-primary-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

// Status badge for bookings
interface StatusBadgeProps {
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const },
    confirmed: { label: "Confirmed", variant: "success" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
    completed: { label: "Completed", variant: "secondary" as const },
    no_show: { label: "No Show", variant: "destructive" as const },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// Available now badge
export function AvailableBadge({ className }: { className?: string }) {
  return (
    <Badge variant="success" className={cn("animate-pulse", className)}>
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success-500" />
      Available Now
    </Badge>
  );
}

// Category badge with color mapping (accepts string or object with name for API compatibility)
interface CategoryBadgeProps {
  category: string | { name?: string } | null | undefined;
  className?: string;
}

function toCategoryString(cat: string | { name?: string } | null | undefined): string {
  if (typeof cat === "string" && cat) return cat;
  if (cat && typeof cat === "object" && typeof (cat as { name?: string }).name === "string")
    return (cat as { name: string }).name;
  return "";
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const categoryVariants: Record<string, "spa" | "salon" | "barber" | "nails" | "default"> = {
    "spa & massage": "spa",
    "spa": "spa",
    "massage": "spa",
    "hair salon": "salon",
    "salon": "salon",
    "beauty": "salon",
    "barber": "barber",
    "barbershop": "barber",
    "nails": "nails",
    "nail salon": "nails",
    "beauty & nails": "nails",
  };

  const str = toCategoryString(category);
  if (!str) return null;

  const variant = categoryVariants[str.toLowerCase()] || "default";

  return (
    <Badge variant={variant} className={className}>
      {str}
    </Badge>
  );
}

export { Badge,  };
