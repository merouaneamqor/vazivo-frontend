"use client";

import * as React from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onAction: () => void;
}

interface SwipeActionRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function SwipeActionRow({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeActionRowProps) {
  const controls = useAnimation();
  const [actionTriggered, setActionTriggered] = React.useState<"left" | "right" | null>(null);

  const totalLeftWidth = leftActions.length * threshold;
  const totalRightWidth = rightActions.length * threshold;

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Fast swipe triggers action
    if (Math.abs(velocity) > 500) {
      if (velocity > 0 && leftActions.length > 0) {
        setActionTriggered("left");
        await controls.start({ x: totalLeftWidth });
        leftActions[0].onAction();
        setTimeout(() => {
          controls.start({ x: 0 });
          setActionTriggered(null);
        }, 300);
        return;
      }
      if (velocity < 0 && rightActions.length > 0) {
        setActionTriggered("right");
        await controls.start({ x: -totalRightWidth });
        rightActions[0].onAction();
        setTimeout(() => {
          controls.start({ x: 0 });
          setActionTriggered(null);
        }, 300);
        return;
      }
    }

    // Check if dragged past threshold
    if (offset > threshold && leftActions.length > 0) {
      await controls.start({ x: totalLeftWidth });
      setActionTriggered("left");
      return;
    }
    if (offset < -threshold && rightActions.length > 0) {
      await controls.start({ x: -totalRightWidth });
      setActionTriggered("right");
      return;
    }

    // Snap back
    controls.start({ x: 0 });
    setActionTriggered(null);
  };

  const handleActionClick = (action: SwipeAction, side: "left" | "right") => {
    action.onAction();
    controls.start({ x: 0 });
    setActionTriggered(null);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex">
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action, "left")}
              className={cn(
                "flex flex-col items-center justify-center px-6 transition-all",
                action.bgColor
              )}
              style={{ width: threshold }}
            >
              <span className={cn("mb-1", action.color)}>{action.icon}</span>
              <span className={cn("text-xs font-medium", action.color)}>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex">
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action, "right")}
              className={cn(
                "flex flex-col items-center justify-center px-6 transition-all",
                action.bgColor
              )}
              style={{ width: threshold }}
            >
              <span className={cn("mb-1", action.color)}>{action.icon}</span>
              <span className={cn("text-xs font-medium", action.color)}>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -totalRightWidth, right: totalLeftWidth }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative bg-white"
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
