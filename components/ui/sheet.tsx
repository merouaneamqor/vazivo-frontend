"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </>
  );
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-white p-6 shadow-lg transition-transform duration-300 ease-in-out",
          side === "top" && "inset-x-0 top-0 border-b animate-in slide-in-from-top",
          side === "bottom" && "inset-x-0 bottom-0 border-t animate-in slide-in-from-bottom",
          side === "left" && "top-16 bottom-0 left-0 w-3/4 border-r animate-in slide-in-from-left sm:max-w-sm",
          side === "right" && "top-16 bottom-0 right-0 w-3/4 border-l animate-in slide-in-from-right sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-neutral-900", className)} {...props} />
  )
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-neutral-500", className)} {...props} />
  )
);
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle,  };
