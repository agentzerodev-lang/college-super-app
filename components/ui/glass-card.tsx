"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/components/motion/variants";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "bordered" | "gradient";
  hover?: boolean;
  tilt?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = "default", hover = true, tilt = false, glow = false, interactive = false, ...props }, ref) => {
    const baseStyles = cn(
      "relative overflow-hidden rounded-2xl",
      "backdrop-blur-xl backdrop-saturate-150",
      "bg-white/[0.03] dark:bg-dark-900/50",
      "border border-white/10 dark:border-white/[0.05]",
      "shadow-glass"
    );

    const variants = {
      default: "",
      elevated: "bg-white/[0.05] dark:bg-dark-800/60 shadow-glass-lg",
      bordered: "border-white/20 dark:border-white/10",
      gradient: "bg-gradient-to-br from-white/[0.08] to-white/[0.02] dark:from-dark-800/70 dark:to-dark-900/50",
    };

    const hoverStyles = hover
      ? "transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-glass-lg dark:hover:bg-dark-800/70"
      : "";

    const glowStyles = glow
      ? "shadow-glow hover:shadow-glow-lg"
      : "";

    if (interactive || tilt) {
      return (
        <motion.div
          ref={ref}
          initial={{ scale: 1, y: 0, rotateX: 0, rotateY: 0 }}
          whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className={cn(baseStyles, variants[variant], hoverStyles, glowStyles, className)}
          {...(props as HTMLMotionProps<"div">)}
        >
          {glow && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
          <div className="relative z-10">{children}</div>
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cn(baseStyles, variants[variant], hoverStyles, glowStyles, className)} {...props}>
        {glow && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

interface GlassCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCardHeader({ children, className, ...props }: GlassCardHeaderProps) {
  return (
    <div className={cn("p-6 pb-0", className)} {...props}>
      {children}
    </div>
  );
}

interface GlassCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function GlassCardTitle({ children, className, ...props }: GlassCardTitleProps) {
  return (
    <h3 className={cn("text-xl font-semibold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

interface GlassCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function GlassCardDescription({ children, className, ...props }: GlassCardDescriptionProps) {
  return (
    <p className={cn("mt-1 text-sm text-slate-400", className)} {...props}>
      {children}
    </p>
  );
}

interface GlassCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCardContent({ children, className, ...props }: GlassCardContentProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

interface GlassCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCardFooter({ children, className, ...props }: GlassCardFooterProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

interface GradientBorderCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gradient?: string;
}

export const GradientBorderCard = forwardRef<HTMLDivElement, GradientBorderCardProps>(
  ({ children, className, gradient = "from-primary-500 via-accent-500 to-primary-500", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative p-[1px] rounded-2xl overflow-hidden group", className)} {...props}>
        <div className={cn("absolute inset-0 bg-gradient-to-r", gradient, "opacity-50 group-hover:opacity-100 transition-opacity duration-500")} />
        <div className="relative backdrop-blur-xl bg-dark-900/90 rounded-2xl">
          {children}
        </div>
      </div>
    );
  }
);

GradientBorderCard.displayName = "GradientBorderCard";
