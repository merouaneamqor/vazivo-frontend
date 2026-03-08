"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center  bg-neutral-100 p-1 text-neutral-500",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-soft",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Animated Tabs with underline indicator
interface AnimatedTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "default" | "underline" | "pills";
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "default",
}: AnimatedTabsProps) {
  const [tabWidths, setTabWidths] = React.useState<Record<string, number>>({});
  const [tabOffsets, setTabOffsets] = React.useState<Record<string, number>>({});
  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    const widths: Record<string, number> = {};
    const offsets: Record<string, number> = {};
    let currentOffset = 0;

    tabsRef.current.forEach((tab, index) => {
      if (tab) {
        const tabId = tabs[index].id;
        widths[tabId] = tab.offsetWidth;
        offsets[tabId] = currentOffset;
        currentOffset += tab.offsetWidth + 8; // 8px gap
      }
    });

    setTabWidths(widths);
    setTabOffsets(offsets);
  }, [tabs]);

  if (variant === "underline") {
    return (
      <div className={cn("relative", className)}>
        <div className="flex gap-2 border-b border-neutral-200">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { tabsRef.current[index] = el; }}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary-600"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-primary-500 rounded-full"
            initial={false}
            animate={{
              width: tabWidths[activeTab] || 0,
              x: tabOffsets[activeTab] || 0,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div className={cn("relative inline-flex gap-1 p-1 bg-neutral-100 ", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.id
                ? "text-primary-600"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
        <motion.div
          className="absolute inset-y-1 bg-white rounded-lg shadow-soft"
          initial={false}
          animate={{
            width: tabWidths[activeTab] || 0,
            x: tabOffsets[activeTab] || 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === tab.id
              ? "bg-primary-100 text-primary-700"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
          )}
        >
          <span className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
