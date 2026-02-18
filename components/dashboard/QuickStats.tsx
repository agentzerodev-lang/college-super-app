"use client";

import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "indigo" | "teal" | "amber" | "rose" | "emerald" | "purple";
}

interface QuickStatsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

const colorVariants = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950",
    text: "text-teal-600 dark:text-teal-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950",
    text: "text-rose-600 dark:text-rose-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-600 dark:text-purple-400",
  },
};

export function QuickStats({ stats, columns = 4 }: QuickStatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const variants = colorVariants[stat.color || "indigo"];

        return (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              {Icon && (
                <div className={`p-2 rounded-lg ${variants.bg}`}>
                  <Icon className={`w-4 h-4 ${variants.text}`} />
                </div>
              )}
              {stat.trend && (
                <span
                  className={`text-xs font-medium ${
                    stat.trend.isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {stat.trend.isPositive ? "+" : ""}
                  {stat.trend.value}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
