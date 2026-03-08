import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-glow",
        destructive: "bg-error-500 text-white hover:bg-error-600",
        outline: "border border-neutral-300 bg-white text-black-900 hover:bg-neutral-100 hover:border-primary-400 hover:text-primary-600",
        secondary: "bg-black-900 text-white hover:bg-black-800 shadow-soft",
        secondaryPurple: "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100",
        ghost: "text-black-600 hover:bg-neutral-100 hover:text-black-900",
        link: "text-primary-600 underline-offset-4 hover:underline",
        accent: "bg-accent-500 text-white hover:bg-accent-600 shadow-soft hover:shadow-glow-accent",
        success: "bg-success-500 text-white hover:bg-success-600",
        dark: "bg-white text-black-900 hover:bg-neutral-100 shadow-soft focus-visible:ring-offset-black-900",
        darkOutline: "border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50 focus-visible:ring-offset-black-900 focus-visible:ring-white/50",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading, 
    leftIcon,
    rightIcon,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    // When asChild is true, render children directly without wrapping
    // The child element should handle its own content
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
