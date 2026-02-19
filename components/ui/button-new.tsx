"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/components/motion/variants";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost" | "glass" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  glow?: boolean;
  animated?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      glow = false,
      animated = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-medium rounded-xl",
      "transition-all duration-300",
      "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-900",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    );

    const variants = {
      primary: cn(
        "bg-primary-500 text-white",
        "hover:bg-primary-600",
        "active:bg-primary-700",
        glow && "shadow-glow hover:shadow-glow-lg"
      ),
      secondary: cn(
        "bg-dark-700 text-slate-200",
        "hover:bg-dark-600",
        "active:bg-dark-800",
        "border border-white/10"
      ),
      accent: cn(
        "bg-accent-500 text-white",
        "hover:bg-accent-600",
        "active:bg-accent-700",
        glow && "shadow-glow-accent"
      ),
      danger: cn(
        "bg-error-500 text-white",
        "hover:bg-error-600",
        "active:bg-error-700"
      ),
      ghost: cn(
        "bg-transparent text-slate-300",
        "hover:bg-white/5 hover:text-white",
        "active:bg-white/10"
      ),
      glass: cn(
        "backdrop-blur-xl",
        "bg-white/5 text-white",
        "border border-white/10",
        "hover:bg-white/10 hover:border-white/20",
        "active:bg-white/15"
      ),
      gradient: cn(
        "bg-gradient-to-r from-primary-500 to-accent-500 text-white",
        "bg-[length:200%_100%]",
        "hover:bg-right",
        glow && "shadow-glow"
      ),
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg rounded-2xl",
    };

    if (animated && !disabled && !isLoading) {
      return (
        <motion.button
          ref={ref}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          disabled={disabled || isLoading}
          {...(props as HTMLMotionProps<"button">)}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {leftIcon}
              {children}
              {rightIcon}
            </>
          )}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, variant = "ghost", size = "md", animated = true, className, disabled, ...props }, ref) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center",
      "rounded-xl",
      "transition-all duration-200",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600",
      secondary: "bg-dark-700 text-slate-200 hover:bg-dark-600 border border-white/10",
      ghost: "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white",
      glass: "backdrop-blur-xl bg-white/5 text-white border border-white/10 hover:bg-white/10",
    };

    const sizes = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    if (animated && !disabled) {
      return (
        <motion.button
          ref={ref}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          disabled={disabled}
          {...(props as HTMLMotionProps<"button">)}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
