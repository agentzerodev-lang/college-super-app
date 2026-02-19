---
phase: PHASE-1-design-system
plan: 04
type: execute
wave: 4
depends_on:
  - PHASE-1-01
  - PHASE-1-02
  - PHASE-1-03
files_modified:
  - components/ui/skeleton.tsx
  - components/ui/typography.tsx
  - components/ui/index.ts
autonomous: true
requirements:
  - DSYS-05
  - DSYS-07
must_haves:
  truths:
    - "Skeleton loader shows shimmer animation while content loads"
    - "Typography components provide consistent text styling"
    - "All UI components exportable from single index file"
    - "Skeleton variants match common UI patterns (text, avatar, card)"
  artifacts:
    - path: "components/ui/skeleton.tsx"
      provides: "Loading skeleton with shimmer animation"
      exports: ["Skeleton", "SkeletonText", "SkeletonAvatar", "SkeletonCard"]
      min_lines: 80
    - path: "components/ui/typography.tsx"
      provides: "Typography components with confident spacing"
      exports: ["Typography", "H1", "H2", "H3", "H4", "P", "Muted"]
      min_lines: 60
    - path: "components/ui/index.ts"
      provides: "Central export for all UI components"
      contains: "export.*from.*glass-card|button|input|skeleton"
  key_links:
    - from: "components/ui/skeleton.tsx"
      to: "shimmer animation in Tailwind"
      via: "animate-shimmer class"
      pattern: "animate-shimmer"
    - from: "components/ui/index.ts"
      to: "all UI components"
      via: "barrel exports"
      pattern: "export.*from"
---

<objective>
Create supporting UI components for loading states and typography, plus centralize exports.

Purpose: Complete the design system foundation with skeleton loaders for async states, typography for consistent text hierarchy, and a barrel export for clean imports throughout the app.
Output: Skeleton components with shimmer, Typography system, Central UI exports.
</objective>

<execution_context>
@/home/dev/.config/opencode/get-shit-done/workflows/execute-plan.md
@/home/dev/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Design tokens from PHASE-1-01
@tailwind.config.ts

# Existing Card for reference
@components/ui/Card.tsx
</context>

<tasks>

<task type="auto">
  <name>Create Skeleton component with shimmer animation</name>
  <files>components/ui/skeleton.tsx</files>
  <action>
    Create skeleton loader components with shimmer animation for loading states.

    First, ensure the shimmer animation is in tailwind.config.ts (from PHASE-1-01 - verify it exists, add if not):
    ```typescript
    animation: {
      shimmer: "shimmer 2s linear infinite",
    },
    keyframes: {
      shimmer: {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
    }
    ```

    Then create components/ui/skeleton.tsx:

    ```typescript
    "use client";

    import { cn } from "@/lib/utils";
    import { motion } from "framer-motion";

    interface SkeletonProps {
      className?: string;
    }

    // Base skeleton with shimmer effect
    export function Skeleton({ className }: SkeletonProps) {
      return (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg",
            "bg-white/5",
            className
          )}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            }}
          />
        </div>
      );
    }

    // Pre-built skeleton variants
    export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
      return (
        <div className={cn("space-y-2", className)}>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-4",
                i === lines - 1 ? "w-3/4" : "w-full"
              )}
            />
          ))}
        </div>
      );
    }

    export function SkeletonAvatar({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
      const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
      };

      return (
        <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
      );
    }

    export function SkeletonCard({ className }: SkeletonProps) {
      return (
        <motion.div
          className={cn(
            "rounded-2xl p-4 space-y-4",
            "bg-white/5 backdrop-blur-xl",
            "border border-white/10",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonText lines={2} />
        </motion.div>
      );
    }

    // Skeleton for buttons
    export function SkeletonButton({ className }: SkeletonProps) {
      return (
        <Skeleton className={cn("h-10 w-24 rounded-xl", className)} />
      );
    }
    ```

    Key features:
    - Base Skeleton with shimmer animation overlay
    - SkeletonText for multi-line text placeholders
    - SkeletonAvatar with size variants
    - SkeletonCard as pre-built card skeleton
    - SkeletonButton for button placeholders
    - All use glassmorphism background for consistency
  </action>
  <verify>
    grep -E "Skeleton|animate-shimmer" components/ui/skeleton.tsx
    npx tsc --noEmit components/ui/skeleton.tsx 2>&1 | head -10
  </verify>
  <done>
    Skeleton component with shimmer animation works.
    Pre-built variants (Text, Avatar, Card) available.
    Animation uses glassmorphism background.
  </done>
</task>

<task type="auto">
  <name>Create Typography component system</name>
  <files>components/ui/typography.tsx</files>
  <action>
    Create typography components with confident spacing and consistent text hierarchy.

    ```typescript
    "use client";

    import { ReactNode } from "react";
    import { cn } from "@/lib/utils";

    interface TypographyProps {
      children: ReactNode;
      className?: string;
    }

    // Heading components with consistent spacing
    export function H1({ children, className }: TypographyProps) {
      return (
        <h1 className={cn(
          "text-4xl md:text-5xl font-bold tracking-tight",
          "text-white",
          "mb-6",
          className
        )}>
          {children}
        </h1>
      );
    }

    export function H2({ children, className }: TypographyProps) {
      return (
        <h2 className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight",
          "text-white",
          "mb-4",
          className
        )}>
          {children}
        </h2>
      );
    }

    export function H3({ children, className }: TypographyProps) {
      return (
        <h3 className={cn(
          "text-2xl font-semibold tracking-tight",
          "text-white",
          "mb-3",
          className
        )}>
          {children}
        </h3>
      );
    }

    export function H4({ children, className }: TypographyProps) {
      return (
        <h4 className={cn(
          "text-xl font-semibold",
          "text-white",
          "mb-2",
          className
        )}>
          {children}
        </h4>
      );
    }

    // Paragraph components
    export function P({ children, className }: TypographyProps) {
      return (
        <p className={cn(
          "text-base leading-relaxed",
          "text-slate-300",
          "mb-4",
          className
        )}>
          {children}
        </p>
      );
    }

    export function Muted({ children, className }: TypographyProps) {
      return (
        <p className={cn(
          "text-sm",
          "text-slate-500",
          className
        )}>
          {children}
        </p>
      );
    }

    // Lead paragraph for hero sections
    export function Lead({ children, className }: TypographyProps) {
      return (
        <p className={cn(
          "text-lg md:text-xl leading-relaxed",
          "text-slate-400",
          "mb-6",
          className
        )}>
          {children}
        </p>
      );
    }

    // Small text
    export function Small({ children, className }: TypographyProps) {
      return (
        <small className={cn(
          "text-xs",
          "text-slate-500",
          className
        )}>
          {children}
        </small>
      );
    }
    ```

    Typography principles:
    - Confident spacing (generous margins)
    - Dark theme optimized colors (white headings, slate body)
    - Responsive sizing where appropriate
    - Consistent tracking and line-height
    - Each component handles its own margin-bottom for rhythm
  </action>
  <verify>
    grep -E "H1|H2|H3|P|Muted|Lead" components/ui/typography.tsx
    npx tsc --noEmit components/ui/typography.tsx 2>&1 | head -10
  </verify>
  <done>
    Typography components (H1-H4, P, Muted, Lead, Small) created.
    Dark theme colors applied (white headings, slate text).
    Consistent spacing rhythm established.
  </done>
</task>

<task type="auto">
  <name>Create central UI exports barrel file</name>
  <files>components/ui/index.ts</files>
  <action>
    Create components/ui/index.ts that re-exports all UI components for clean imports.

    ```typescript
    // Core components
    export { GlassCard } from "./glass-card";
    export { Button } from "./button";
    export { Input } from "./input";

    // Loading states
    export {
      Skeleton,
      SkeletonText,
      SkeletonAvatar,
      SkeletonCard,
      SkeletonButton
    } from "./skeleton";

    // Typography
    export {
      H1, H2, H3, H4,
      P, Muted, Lead, Small
    } from "./typography";

    // Legacy Card (keep for backward compatibility)
    export { Card } from "./Card";
    ```

    This allows imports like:
    ```typescript
    import { GlassCard, Button, Skeleton, H2 } from "@/components/ui";
    ```

    Instead of:
    ```typescript
    import { GlassCard } from "@/components/ui/glass-card";
    import { Button } from "@/components/ui/button";
    // etc.
    ```
  </action>
  <verify>
    grep -E "export.*from" components/ui/index.ts | wc -l
    # Should have multiple export lines
  </verify>
  <done>
    components/ui/index.ts exports all UI components.
    Clean import syntax available.
    Legacy Card preserved for backward compatibility.
  </done>
</task>

</tasks>

<verification>
1. Skeleton shimmer works: Animation plays on skeleton elements
2. Typography renders: H1-H4, P, Muted components work
3. Barrel exports: import { GlassCard, Button, Skeleton, H2 } from "@/components/ui" succeeds
4. TypeScript compiles: npx tsc --noEmit passes
5. No build errors: npm run build succeeds
</verification>

<success_criteria>
- [ ] Skeleton component with shimmer animation
- [ ] SkeletonText, SkeletonAvatar, SkeletonCard variants
- [ ] Typography components (H1-H4, P, Muted, Lead, Small)
- [ ] components/ui/index.ts barrel exports
- [ ] All imports work with @/ alias
- [ ] Dark theme colors applied throughout
</success_criteria>

<output>
After completion, create `.planning/phases/PHASE-1-design-system/PHASE-1-04-SUMMARY.md`
</output>
