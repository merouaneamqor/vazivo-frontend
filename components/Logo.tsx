"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  href?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
  className?: string;
}

const sizes = {
  sm: { text: "text-xl", icon: 28 },
  md: { text: "text-2xl", icon: 36 },
  lg: { text: "text-3xl", icon: 44 },
};

export function Logo({
  variant = "full",
  href = "/",
  size = "md",
  light = false,
  className,
}: LogoProps) {
  const s = sizes[size];

  const textColor = light ? "text-white" : "text-neutral-900";
  const gradientId = `vazivo-logo-grad-${size}-${light ? "light" : "dark"}`;

  const icon = (
    <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#9D0208" />
          <stop offset="100%" stopColor="#E85D04" />
        </linearGradient>
      </defs>

      {/* Restaurant / dining icon: simple plate with fork */}
      <circle cx="50" cy="50" r="42" fill={`url(#${gradientId})`} />
      <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="4" opacity={0.9} />
      <path d="M50 22 v8 M50 70 v8 M46 50 h-12 M66 50 h12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
    </svg>
  );

  const content =
    variant === "icon" ? (
      icon
    ) : (
      <>
        {icon}
        <span
          className={cn(
            "font-logo font-semibold tracking-tight whitespace-nowrap shrink-0",
            s.text,
            textColor
          )}
        >
          Vazivo
        </span>
      </>
    );

  const wrapperClass = cn(
    "inline-flex items-center gap-3 transition-transform hover:scale-[1.03] shrink-0",
    className
  );

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label="Vazivo – Home">
        {content}
      </Link>
    );
  }

  return <span className={wrapperClass}>{content}</span>;
}