"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { spring } from "./variants";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  tilt?: boolean;
  glow?: boolean;
  hoverScale?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, tilt: _tilt = true, glow: _glow = false, hoverScale = 1.02, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={{
          initial: { scale: 1, y: 0 },
          hover: { scale: hoverScale, y: -4 },
          tap: { scale: 0.98 },
        }}
        transition={spring}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  glowOnHover?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, glowOnHover: _glowOnHover = false, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

interface AnimatedListProps extends HTMLMotionProps<"div"> {
  stagger?: number;
  delay?: number;
}

export const AnimatedList = forwardRef<HTMLDivElement, AnimatedListProps>(
  ({ children, className, stagger = 0.08, delay = 0.1, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          initial: {},
          animate: {
            transition: {
              staggerChildren: stagger,
              delayChildren: delay,
            },
          },
          exit: {
            transition: {
              staggerChildren: 0.05,
              staggerDirection: -1,
            },
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";

export const AnimatedListItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedListItem.displayName = "AnimatedListItem";

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, duration = 1, className, prefix = "", suffix = "" }: CounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
}
