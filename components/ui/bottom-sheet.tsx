"use client";

import * as React from "react";
import { motion, AnimatePresence, PanInfo, useAnimation } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  snapPoints?: number[];
  initialSnap?: number;
  className?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  className,
  showHandle = true,
  showCloseButton = true,
  preventClose = false,
}: BottomSheetProps) {
  const controls = useAnimation();
  const [currentSnap, setCurrentSnap] = React.useState(initialSnap);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const getSnapHeight = (index: number) => {
    if (typeof window === "undefined") return 0;
    return window.innerHeight * snapPoints[index];
  };

  React.useEffect(() => {
    if (isOpen) {
      controls.start({
        y: -getSnapHeight(initialSnap),
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    }
  }, [isOpen, controls, initialSnap]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Fast swipe down - close
    if (velocity > 500 && !preventClose) {
      onClose();
      return;
    }

    // Fast swipe up - expand
    if (velocity < -500 && currentSnap < snapPoints.length - 1) {
      const newSnap = currentSnap + 1;
      setCurrentSnap(newSnap);
      controls.start({
        y: -getSnapHeight(newSnap),
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
      return;
    }

    // Calculate which snap point to go to based on current position
    const currentHeight = getSnapHeight(currentSnap);
    const newHeight = currentHeight - offset;

    let closestSnap = 0;
    let closestDistance = Infinity;

    snapPoints.forEach((_, index) => {
      const snapHeight = getSnapHeight(index);
      const distance = Math.abs(newHeight - snapHeight);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnap = index;
      }
    });

    // Check if we should close (dragged below minimum)
    if (newHeight < getSnapHeight(0) * 0.5 && !preventClose) {
      onClose();
      return;
    }

    setCurrentSnap(closestSnap);
    controls.start({
      y: -getSnapHeight(closestSnap),
      transition: { type: "spring", damping: 30, stiffness: 300 },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={preventClose ? undefined : onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={controls}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: -getSnapHeight(snapPoints.length - 1), bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl",
              "max-h-[95vh] overflow-hidden",
              className
            )}
            style={{ touchAction: "none" }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-neutral-300" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-4 pb-3 border-b border-neutral-100">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
                  )}
                </div>
                {showCloseButton && !preventClose && (
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(95vh - 80px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple action sheet variant
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }[];
  title?: string;
  cancelLabel?: string;
}

export function ActionSheet({
  isOpen,
  onClose,
  actions,
  title,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
          >
            <div className="bg-white  overflow-hidden shadow-2xl">
              {title && (
                <div className="px-4 py-3 text-center border-b border-neutral-100">
                  <p className="text-sm text-neutral-500">{title}</p>
                </div>
              )}
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className={cn(
                    "w-full px-4 py-4 flex items-center justify-center gap-3 text-base font-medium",
                    "border-b border-neutral-100 last:border-0 transition-colors",
                    action.variant === "destructive"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-neutral-900 hover:bg-neutral-50"
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 px-4 py-4 bg-white  text-base font-semibold text-primary-600 hover:bg-neutral-50 transition-colors"
            >
              {cancelLabel}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
