"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: "indigo" | "teal" | "amber" | "rose" | "emerald" | "purple";
  badge?: string;
  disabled?: boolean;
}

const colorVariants = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    icon: "text-indigo-600 dark:text-indigo-400",
    hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950",
    icon: "text-teal-600 dark:text-teal-400",
    hover: "hover:bg-teal-100 dark:hover:bg-teal-900",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950",
    icon: "text-amber-600 dark:text-amber-400",
    hover: "hover:bg-amber-100 dark:hover:bg-amber-900",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950",
    icon: "text-rose-600 dark:text-rose-400",
    hover: "hover:bg-rose-100 dark:hover:bg-rose-900",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    icon: "text-emerald-600 dark:text-emerald-400",
    hover: "hover:bg-emerald-100 dark:hover:bg-emerald-900",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    icon: "text-purple-600 dark:text-purple-400",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900",
  },
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  color = "indigo",
  badge,
  disabled = false,
}: FeatureCardProps) {
  const variants = colorVariants[color];

  if (disabled) {
    return (
      <div className="card opacity-50 cursor-not-allowed">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${variants.bg}`}>
            <Icon className={`w-5 h-5 ${variants.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="block">
      <div className={`card transition-colors duration-200 ${variants.hover}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${variants.bg}`}>
            <Icon className={`w-5 h-5 ${variants.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
