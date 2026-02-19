"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/components/motion/variants";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: "primary" | "accent" | "success" | "warning" | "error" | "purple";
  badge?: string;
  disabled?: boolean;
}

const colorVariants = {
  primary: {
    gradient: "from-primary-500 to-primary-600",
    icon: "text-primary-400",
    glow: "group-hover:shadow-glow",
    bg: "bg-primary-500/10",
  },
  accent: {
    gradient: "from-accent-500 to-accent-600",
    icon: "text-accent-400",
    glow: "group-hover:shadow-glow-accent",
    bg: "bg-accent-500/10",
  },
  success: {
    gradient: "from-success-500 to-success-600",
    icon: "text-success-500",
    glow: "",
    bg: "bg-success-500/10",
  },
  warning: {
    gradient: "from-warning-500 to-warning-600",
    icon: "text-warning-500",
    glow: "",
    bg: "bg-warning-500/10",
  },
  error: {
    gradient: "from-error-500 to-error-600",
    icon: "text-error-500",
    glow: "",
    bg: "bg-error-500/10",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    icon: "text-purple-400",
    glow: "",
    bg: "bg-purple-500/10",
  },
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  color = "primary",
  badge,
  disabled = false,
}: FeatureCardProps) {
  const variants = colorVariants[color];

  if (disabled) {
    return (
      <div className="opacity-50 cursor-not-allowed rounded-2xl bg-dark-800/30 border border-white/5 p-5">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", variants.bg)}>
            <Icon className={cn("w-5 h-5", variants.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-300 truncate">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
        className={cn(
          "relative overflow-hidden rounded-2xl p-5",
          "backdrop-blur-xl bg-dark-800/50",
          "border border-white/5",
          "transition-all duration-300",
          "hover:border-white/10 hover:bg-dark-800/70",
          "shadow-glass",
          variants.glow
        )}
      >
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br",
          variants.gradient,
          "opacity-5"
        )} />
        
        <div className="relative z-10 flex items-start gap-4">
          <motion.div
            whileHover={{ rotate: 5 }}
            className={cn(
              "p-3 rounded-xl shrink-0",
              variants.bg,
              "border border-white/10"
            )}
          >
            <Icon className={cn("w-5 h-5", variants.icon)} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                {title}
              </h3>
              {badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-full",
                    "bg-gradient-to-r",
                    variants.gradient,
                    "text-white"
                  )}
                >
                  {badge}
                </motion.span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="text-slate-500 group-hover:text-primary-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
