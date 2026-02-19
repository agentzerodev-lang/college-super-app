"use client";

import { type HTMLAttributes, forwardRef, type ReactNode, type ElementType } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  animate?: boolean;
  delay?: number;
  children?: ReactNode;
}

function createTypographyComponent(
  defaultTag: ElementType,
  defaultClassName: string
) {
  return forwardRef<HTMLElement, TypographyProps>(function Component(
    { as: Tag = defaultTag, className, animate = false, delay = 0, children, ...props },
    ref
  ) {
    if (animate) {
      return (
        <motion.span
          ref={ref as React.Ref<HTMLSpanElement>}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
          className={cn(defaultClassName, className)}
        >
          {children}
        </motion.span>
      );
    }

    return (
      <Tag ref={ref} className={cn(defaultClassName, className)} {...props}>
        {children}
      </Tag>
    );
  });
}

export const H1 = createTypographyComponent(
  "h1",
  "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
);

export const H2 = createTypographyComponent(
  "h2",
  "text-3xl md:text-4xl font-bold tracking-tight text-white"
);

export const H3 = createTypographyComponent(
  "h3",
  "text-2xl md:text-3xl font-semibold tracking-tight text-white"
);

export const H4 = createTypographyComponent(
  "h4",
  "text-xl md:text-2xl font-semibold text-white"
);

export const H5 = createTypographyComponent(
  "h5",
  "text-lg md:text-xl font-medium text-white"
);

export const H6 = createTypographyComponent(
  "h6",
  "text-base md:text-lg font-medium text-slate-200"
);

export const Text = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement> & { muted?: boolean; small?: boolean }
>(function Text({ className, muted, small, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        "leading-relaxed",
        muted ? "text-slate-400" : "text-slate-300",
        small && "text-sm",
        className
      )}
      {...props}
    />
  );
});

export const Lead = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function Lead({ className, ...props }, ref) {
    return (
      <p ref={ref} className={cn("text-xl text-slate-400 leading-relaxed", className)} {...props} />
    );
  }
);

export const Small = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function Small({ className, ...props }, ref) {
    return (
      <small ref={ref} className={cn("text-sm text-slate-400", className)} {...props} />
    );
  }
);

export const Muted = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function Muted({ className, ...props }, ref) {
    return (
      <span ref={ref} className={cn("text-slate-500", className)} {...props} />
    );
  }
);

export const Label = forwardRef<HTMLLabelElement, HTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...props }, ref) {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium text-slate-300", className)}
        {...props}
      />
    );
  }
);

interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  gradient?: string;
  children?: ReactNode;
}

export const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  function GradientText({ className, gradient = "from-primary-400 via-accent-400 to-primary-400", children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(
          "bg-gradient-to-r bg-clip-text text-transparent",
          gradient,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export const AnimatedGradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  function AnimatedGradientText({ className, gradient = "from-primary-400 via-accent-400 to-primary-400", children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(
          "bg-gradient-to-r bg-clip-text text-transparent",
          gradient,
          "bg-[length:200%_auto] animate-gradient-x",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

interface GlowTextProps extends HTMLAttributes<HTMLSpanElement> {
  glowColor?: string;
  children?: ReactNode;
}

export const GlowText = forwardRef<HTMLSpanElement, GlowTextProps>(
  function GlowText({ className, glowColor = "rgba(14, 165, 233, 0.5)", children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn("relative", className)}
        style={{
          textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);
