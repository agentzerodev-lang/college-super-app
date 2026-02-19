"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/components/motion/variants";

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "accent" | "success" | "warning" | "error" | "purple";
}

interface QuickStatsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

const colorVariants = {
  primary: {
    gradient: "from-primary-500/20 to-primary-500/5",
    icon: "text-primary-400",
    glow: "shadow-glow",
  },
  accent: {
    gradient: "from-accent-500/20 to-accent-500/5",
    icon: "text-accent-400",
    glow: "shadow-glow-accent",
  },
  success: {
    gradient: "from-success-500/20 to-success-500/5",
    icon: "text-success-500",
    glow: "",
  },
  warning: {
    gradient: "from-warning-500/20 to-warning-500/5",
    icon: "text-warning-500",
    glow: "",
  },
  error: {
    gradient: "from-error-500/20 to-error-500/5",
    icon: "text-error-500",
    glow: "",
  },
  purple: {
    gradient: "from-purple-500/20 to-purple-500/5",
    icon: "text-purple-400",
    glow: "",
  },
};

function AnimatedNumber({ value }: { value: string | number }) {
  const isNumber = typeof value === "number";
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
      className="text-3xl font-bold text-white"
    >
      {isNumber ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {value}
        </motion.span>
      ) : (
        value
      )}
    </motion.span>
  );
}

export function QuickStats({ stats, columns = 4 }: QuickStatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("grid gap-4", gridCols[columns])}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const variants = colorVariants[stat.color || "primary"];

        return (
          <motion.div
            key={index}
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative group",
              "backdrop-blur-xl bg-dark-800/50",
              "border border-white/5 rounded-2xl p-6",
              "transition-all duration-300",
              "hover:border-white/10 hover:bg-dark-800/70",
              "shadow-glass hover:shadow-glass-lg"
            )}
          >
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              "bg-gradient-to-br",
              variants.gradient
            )} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                {Icon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 + 0.1 }}
                    className={cn(
                      "p-2.5 rounded-xl",
                      "bg-gradient-to-br from-white/10 to-white/5",
                      "border border-white/10"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", variants.icon)} />
                  </motion.div>
                )}
                {stat.trend && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      stat.trend.isPositive
                        ? "text-success-500 bg-success-500/10"
                        : "text-error-500 bg-error-500/10"
                    )}
                  >
                    {stat.trend.isPositive ? "+" : ""}{stat.trend.value}%
                  </motion.span>
                )}
              </div>

              <div>
                <AnimatedNumber value={stat.value} />
                <p className="text-sm text-slate-400 mt-2 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
