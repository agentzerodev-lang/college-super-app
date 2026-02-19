"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: "default" | "glass" | "minimal";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, hint, leftIcon, rightIcon, variant = "default", className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseStyles = cn(
      "w-full rounded-xl",
      "text-white placeholder:text-slate-500",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    const variants = {
      default: cn(
        "bg-dark-800/50 border border-white/10",
        "hover:border-white/20",
        "focus:border-primary-500/50 focus:ring-primary-500/30",
        error && "border-error-500/50 focus:border-error-500 focus:ring-error-500/30",
        success && "border-success-500/50 focus:border-success-500 focus:ring-success-500/30"
      ),
      glass: cn(
        "backdrop-blur-xl bg-white/5 border border-white/10",
        "hover:bg-white/8 hover:border-white/15",
        "focus:bg-white/10 focus:border-primary-500/50 focus:ring-primary-500/30",
        error && "border-error-500/50 focus:border-error-500 focus:ring-error-500/30",
        success && "border-success-500/50 focus:border-success-500 focus:ring-success-500/30"
      ),
      minimal: cn(
        "bg-transparent border-b border-white/20 rounded-none",
        "hover:border-white/30",
        "focus:border-primary-500 focus:ring-0",
        error && "border-error-500",
        success && "border-success-500"
      ),
    };

    const paddingStyles = cn(
      leftIcon ? "pl-11" : "pl-4",
      rightIcon ? "pr-11" : "pr-4",
      "py-3"
    );

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{leftIcon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(baseStyles, variants[variant], paddingStyles, className)}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{rightIcon}</div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-error-500"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-success-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </motion.div>
          )}
          {hint && !error && !success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-slate-500"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  variant?: "default" | "glass" | "minimal";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, success, hint, variant = "default", className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseStyles = cn(
      "w-full rounded-xl",
      "text-white placeholder:text-slate-500",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "resize-none"
    );

    const variants = {
      default: cn(
        "bg-dark-800/50 border border-white/10",
        "hover:border-white/20",
        "focus:border-primary-500/50 focus:ring-primary-500/30",
        error && "border-error-500/50 focus:border-error-500 focus:ring-error-500/30",
        success && "border-success-500/50 focus:border-success-500 focus:ring-success-500/30"
      ),
      glass: cn(
        "backdrop-blur-xl bg-white/5 border border-white/10",
        "hover:bg-white/8 hover:border-white/15",
        "focus:bg-white/10 focus:border-primary-500/50 focus:ring-primary-500/30",
        error && "border-error-500/50 focus:border-error-500 focus:ring-error-500/30",
        success && "border-success-500/50 focus:border-success-500 focus:ring-success-500/30"
      ),
      minimal: cn(
        "bg-transparent border-b border-white/20 rounded-none",
        "hover:border-white/30",
        "focus:border-primary-500 focus:ring-0",
        error && "border-error-500",
        success && "border-success-500"
      ),
    };

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea ref={ref} id={inputId} className={cn(baseStyles, variants[variant], "px-4 py-3", className)} {...props} />
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-error-500"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-success-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </motion.div>
          )}
          {hint && !error && !success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500">
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  variant?: "default" | "glass";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, variant = "default", className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseStyles = cn(
      "w-full rounded-xl px-4 py-3",
      "text-white",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "appearance-none cursor-pointer",
      "bg-no-repeat bg-right"
    );

    const variants = {
      default: cn(
        "bg-dark-800/50 border border-white/10",
        "hover:border-white/20",
        "focus:border-primary-500/50 focus:ring-primary-500/30",
        error && "border-error-500/50 focus:border-error-500 focus:ring-error-500/30"
      ),
      glass: cn(
        "backdrop-blur-xl bg-white/5 border border-white/10",
        "hover:bg-white/8 hover:border-white/15",
        "focus:bg-white/10 focus:border-primary-500/50 focus:ring-primary-500/30",
        error && "border-error-500/50 focus:border-error-500 focus:ring-error-500/30"
      ),
    };

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select ref={ref} id={inputId} className={cn(baseStyles, variants[variant], className)} {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-dark-800">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-error-500"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = "Select";
