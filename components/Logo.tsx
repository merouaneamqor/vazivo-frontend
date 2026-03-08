"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
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
  const gradientId = `ollazen-owl-grad-${size}-${light ? "light" : "dark"}`;

  const icon = (
    <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>

      {/* owl head */}
      <circle cx="50" cy="50" r="42" fill={`url(#${gradientId})`} />

      {/* owl eyes */}
      <circle cx="35" cy="45" r="10" fill="white" />
      <circle cx="65" cy="45" r="10" fill="white" />

      {/* pupils */}
      <circle cx="35" cy="45" r="4" fill="#4C1D95" />
      <circle cx="65" cy="45" r="4" fill="#4C1D95" />

      {/* beak */}
      <polygon points="50,55 44,65 56,65" fill="#4C1D95" />
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
          Olla<span className="text-primary-600">Zen</span>
        </span>
      </>
    );

  const wrapperClass = cn(
    "inline-flex items-center gap-3 transition-transform hover:scale-[1.03] shrink-0",
    className
  );

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label="OllaZen – Home">
        {content}
      </Link>
    );
  }

  return <span className={wrapperClass}>{content}</span>;
}