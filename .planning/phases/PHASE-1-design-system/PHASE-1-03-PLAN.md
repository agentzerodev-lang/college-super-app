---
phase: PHASE-1-design-system
plan: 03
type: execute
wave: 3
depends_on:
  - PHASE-1-01
  - PHASE-1-02
files_modified:
  - components/ui/glass-card.tsx
  - components/ui/button.tsx
  - components/ui/input.tsx
autonomous: true
requirements:
  - DSYS-02
  - DSYS-03
  - DSYS-04
must_haves:
  truths:
    - "GlassCard renders with backdrop blur and semi-transparent background"
    - "GlassCard tilts on hover with 3D perspective effect"
    - "Button scales on hover, glows on press, has inertia effect"
    - "Input has glassmorphism styling with focus ring animation"
    - "All components use cn() for class merging"
  artifacts:
    - path: "components/ui/glass-card.tsx"
      provides: "Glassmorphism card with hover tilt"
      exports: ["GlassCard"]
      min_lines: 60
    - path: "components/ui/button.tsx"
      provides: "Animated button with glow and scale"
      exports: ["Button"] (enhanced version)
      min_lines: 100
    - path: "components/ui/input.tsx"
      provides: "Glassmorphism input with focus animation"
      exports: ["Input"]
      min_lines: 50
  key_links:
    - from: "components/ui/glass-card.tsx"
      to: "cn() utility"
      via: "import from @/lib/utils"
      pattern: "import.*cn.*from.*@/lib/utils"
    - from: "components/ui/button.tsx"
      to: "motion variants"
      via: "whileHover, whileTap"
      pattern: "while( Hover|Tap)"
    - from: "components/ui/input.tsx"
      to: "cn() utility"
      via: "class merging"
      pattern: "cn\\("
---

<objective>
Create the core glassmorphism UI components with premium animations and micro-interactions.

Purpose: Build the foundational interactive components that define the app's premium feel. GlassCard provides the visual depth, Button delivers satisfying feedback, Input ensures form elements match the aesthetic.
Output: GlassCard with tilt effect, enhanced Button with glow/scale, Input with glassmorphism.
</objective>

<execution_context>
@/home/dev/.config/opencode/get-shit-done/workflows/execute-plan.md
@/home/dev/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Existing Button to enhance (preserve API)
@components/ui/Button.tsx

# Motion variants to use
@components/motion/variants.ts (from PHASE-1-02)
</context>

<tasks>

<task type="auto">
  <name>Create GlassCard component with hover tilt</name>
  <files>components/ui/glass-card.tsx</files>
  <action>
    Create a premium glassmorphism card component with:
    1. Backdrop blur effect (backdrop-blur-xl)
    2. Semi-transparent background (bg-white/5 dark)
    3. Gradient border (using border + gradient trick or pseudo-element)
    4. 3D tilt effect on hover using Framer Motion
    5. Smooth scale on hover

    Implementation structure:
    ```typescript
    "use client";

    import { motion, HTMLMotionProps } from "framer-motion";
    import { ReactNode, useState, useRef } from "react";
    import { cn } from "@/lib/utils";

    interface GlassCardProps extends HTMLMotionProps<"div"> {
      children: ReactNode;
      className?: string;
      tilt?: boolean; // Enable/disable tilt effect
      glow?: boolean; // Enable gradient glow border
    }

    export function GlassCard({
      children,
      className,
      tilt = true,
      glow = false,
      ...props
    }: GlassCardProps) {
      // Track mouse position for tilt effect
      const [rotateX, setRotateX] = useState(0);
      const [rotateY, setRotateY] = useState(0);
      const cardRef = useRef<HTMLDivElement>(null);

      const handleMouseMove = (e: React.MouseEvent) => {
        if (!tilt || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -5;
        const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * 5;
        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
      };

      const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
      };

      return (
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative rounded-2xl overflow-hidden",
            "bg-white/5 dark:bg-white/[0.03]",
            "backdrop-blur-xl",
            "border border-white/10 dark:border-white/[0.08]",
            "shadow-lg shadow-black/5",
            glow && "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-primary-500 before:to-accent-500 before:-z-10",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
          animate={{
            rotateX: tilt ? rotateX : 0,
            rotateY: tilt ? rotateY : 0,
            scale: 1
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }
    ```

    Key features:
    - Uses Framer Motion's motion.div for animations
    - Tilt is calculated from mouse position relative to card center
    - Spring physics for smooth, natural movement
    - Glow option adds gradient border effect
    - Preserves 3D transform for perspective effect
  </action>
  <verify>
    grep -E "GlassCard|backdrop-blur|whileHover" components/ui/glass-card.tsx
    npx tsc --noEmit components/ui/glass-card.tsx 2>&1 | head -10
  </verify>
  <done>
    GlassCard component exports with tilt and glow options.
    Backdrop blur and semi-transparent background applied.
    Hover triggers tilt effect and subtle scale.
  </done>
</task>

<task type="auto">
  <name>Enhance Button component with scale/glow/inertia</name>
  <files>components/ui/button.tsx</files>
  <action>
    Replace the existing Button.tsx with an enhanced version that includes:
    1. Framer Motion integration for scale on hover, glow on press
    2. Inertia effect on release (spring physics)
    3. Glow ring animation on focus
    4. Preserved existing API (variant, size, isLoading props)

    Create as button.tsx (lowercase for convention, update imports later):

    ```typescript
    "use client";

    import { motion, HTMLMotionProps } from "framer-motion";
    import { ReactNode, forwardRef } from "react";
    import { cn } from "@/lib/utils";

    interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
      children: ReactNode;
      variant?: "primary" | "secondary" | "accent" | "danger" | "ghost" | "glass";
      size?: "sm" | "md" | "lg";
      isLoading?: boolean;
    }

    const variantStyles = {
      primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/25",
      secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/20",
      accent: "bg-accent-500 hover:bg-accent-400 text-white shadow-lg shadow-accent-500/25",
      danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25",
      ghost: "bg-transparent hover:bg-white/10 text-slate-300",
      glass: "bg-white/5 hover:bg-white/10 text-white backdrop-blur-xl border border-white/10",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-4 py-2.5 text-sm rounded-xl",
      lg: "px-6 py-3 text-base rounded-xl",
    };

    export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
      ({ children, variant = "primary", size = "md", isLoading, className, disabled, ...props }, ref) => {
        return (
          <motion.button
            ref={ref}
            className={cn(
              "inline-flex items-center justify-center font-medium transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              variantStyles[variant],
              sizeStyles[size],
              className
            )}
            disabled={disabled || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17
            }}
            {...props}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Loading...
              </span>
            ) : (
              children
            )}
          </motion.button>
        );
      }
    );

    Button.displayName = "Button";
    ```

    Key enhancements over existing Button:
    - motion.button for animations
    - whileHover scales up 2%
    - whileTap scales down 2% (satisfying press)
    - Spring transition for inertia feel
    - Glass variant added for glassmorphism buttons
    - Animated loading spinner with Framer Motion
    - Proper focus ring for accessibility

    Note: This replaces the existing Button.tsx. Update any imports that use "./Button" to "./button" (lowercase).
  </action>
  <verify>
    grep -E "whileHover|whileTap|motion.button" components/ui/button.tsx
    npx tsc --noEmit components/ui/button.tsx 2>&1 | head -10
  </verify>
  <done>
    Button uses Framer Motion for scale animations.
    whileHover/whileTap provide satisfying feedback.
    Spring physics create inertia effect.
    Existing API preserved (variant, size, isLoading).
  </done>
</task>

<task type="auto">
  <name>Create Input component with glassmorphism</name>
  <files>components/ui/input.tsx</files>
  <action>
    Create a glassmorphism input component with:
    1. Semi-transparent background
    2. Backdrop blur effect
    3. Animated focus ring
    4. Smooth border color transitions
    5. Forward ref for form library compatibility

    ```typescript
    "use client";

    import { motion, HTMLMotionProps } from "framer-motion";
    import { forwardRef } from "react";
    import { cn } from "@/lib/utils";

    interface InputProps extends Omit<HTMLMotionProps<"input">, "ref"> {
      label?: string;
      error?: string;
    }

    export const Input = forwardRef<HTMLInputElement, InputProps>(
      ({ className, label, error, ...props }, ref) => {
        return (
          <div className="w-full">
            {label && (
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {label}
              </label>
            )}
            <motion.input
              ref={ref}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl",
                "bg-white/5 backdrop-blur-xl",
                "border border-white/10 hover:border-white/20",
                "text-white placeholder:text-slate-500",
                "focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20",
                "transition-all duration-200",
                error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
                className
              )}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              {...props}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </div>
        );
      }
    );

    Input.displayName = "Input";
    ```

    Features:
    - Glassmorphism background (bg-white/5, backdrop-blur-xl)
    - Subtle border that brightens on hover
    - Primary-colored focus ring
    - Slight scale animation on focus (whileFocus)
    - Error state with animated error message
    - Optional label
    - Forward ref for react-hook-form integration
  </action>
  <verify>
    grep -E "Input|backdrop-blur|whileFocus" components/ui/input.tsx
    npx tsc --noEmit components/ui/input.tsx 2>&1 | head -10
  </verify>
  <done>
    Input component with glassmorphism styling.
    Focus ring animates with primary color.
    Error state shows animated error message.
    Forward ref enables form library integration.
  </done>
</task>

</tasks>

<verification>
1. GlassCard renders: import { GlassCard } from "@/components/ui/glass-card"
2. Button animations work: Button scales on hover/tap
3. Input glassmorphism: Input has backdrop-blur and focus ring
4. TypeScript compiles: npx tsc --noEmit passes for all files
5. cn() utility used in all components
</verification>

<success_criteria>
- [ ] GlassCard with backdrop-blur-xl, gradient border option, tilt on hover
- [ ] Button with whileHover scale 1.02, whileTap scale 0.98, spring physics
- [ ] Input with glassmorphism, focus ring animation, error state
- [ ] All components use cn() for class merging
- [ ] All components are TypeScript-typed with proper interfaces
- [ ] All components forward refs where appropriate
</success_criteria>

<output>
After completion, create `.planning/phases/PHASE-1-design-system/PHASE-1-03-SUMMARY.md`
</output>
