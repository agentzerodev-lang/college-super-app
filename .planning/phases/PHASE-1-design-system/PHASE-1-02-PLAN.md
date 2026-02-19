---
phase: PHASE-1-design-system
plan: 02
type: execute
wave: 2
depends_on:
  - PHASE-1-01
files_modified:
  - components/motion/variants.ts
  - components/motion/index.ts
  - hooks/use-scroll-reveal.ts
  - components/providers/motion-provider.tsx
autonomous: true
requirements:
  - MOTN-01
  - MOTN-02
  - MOTN-03
  - MOTN-04
  - MOTN-05
  - MOTN-06
must_haves:
  truths:
    - "Components can import animation variants (fade, slide, scale) and use them directly"
    - "Scroll-based animations trigger when elements enter viewport"
    - "Page transitions work with smooth fade/slide effects"
    - "Stagger animations delay children sequentially"
    - "Spring physics feel natural and responsive"
  artifacts:
    - path: "components/motion/variants.ts"
      provides: "Reusable animation variants"
      exports: ["fadeVariants", "slideVariants", "scaleVariants", "staggerContainer", "staggerItem"]
    - path: "hooks/use-scroll-reveal.ts"
      provides: "Scroll-triggered animation hook"
      exports: ["useScrollReveal"]
    - path: "components/providers/motion-provider.tsx"
      provides: "Global motion configuration"
      exports: ["MotionProvider"]
  key_links:
    - from: "components/motion/variants.ts"
      to: "all animated components"
      via: "variants prop on motion components"
      pattern: "variants={fadeVariants}"
    - from: "useScrollReveal"
      to: "scroll-triggered elements"
      via: "ref and inView state"
      pattern: "useScrollReveal\\(\\)"
---

<objective>
Create the complete Framer Motion animation system with reusable variants, scroll hooks, and global configuration.

Purpose: Establish motion primitives that will be used throughout the app for consistent, premium animations. All subsequent components will import from this motion system.
Output: Animation variants, scroll reveal hook, motion provider, stagger utilities.
</objective>

<execution_context>
@/home/dev/.config/opencode/get-shit-done/workflows/execute-plan.md
@/home/dev/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Animation timing from ROADMAP
| Animation | Duration | Easing |
|-----------|----------|--------|
| Micro-interaction | 150ms | ease-out |
| Hover effect | 200ms | ease-in-out |
| Page transition | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Scroll reveal | 400ms | ease-out |
| Stagger delay | 50ms | - |
</context>

<tasks>

<task type="auto">
  <name>Create animation variants and utilities</name>
  <files>components/motion/variants.ts, components/motion/index.ts</files>
  <action>
    Create components/motion/ directory and variants.ts with reusable Framer Motion variants.

    In variants.ts, export:

    1. **fadeVariants** - Simple opacity transitions:
       ```typescript
       export const fadeVariants = {
         initial: { opacity: 0 },
         animate: { opacity: 1 },
         exit: { opacity: 0 }
       }
       ```

    2. **slideVariants** - Directional slide animations:
       ```typescript
       export const slideVariants = {
         up: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -20, opacity: 0 } },
         down: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 } },
         left: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } },
         right: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 20, opacity: 0 } }
       }
       ```

    3. **scaleVariants** - Scale with opacity for buttons/cards:
       ```typescript
       export const scaleVariants = {
         initial: { scale: 0.95, opacity: 0 },
         animate: { scale: 1, opacity: 1 },
         exit: { scale: 0.95, opacity: 0 }
       }
       ```

    4. **staggerContainer** - Parent container for staggered children:
       ```typescript
       export const staggerContainer = {
         initial: {},
         animate: {
           transition: { staggerChildren: 0.05, delayChildren: 0.1 }
         }
       }
       ```

    5. **staggerItem** - Child item for stagger animations:
       ```typescript
       export const staggerItem = {
         initial: { opacity: 0, y: 20 },
         animate: { opacity: 1, y: 0 },
         exit: { opacity: 0, y: -20 }
       }
       ```

    6. **springConfig** - Reusable spring physics:
       ```typescript
       export const springConfig = {
         type: "spring",
         stiffness: 300,
         damping: 30
       } as const
       ```

    Also create components/motion/index.ts that re-exports everything for clean imports.

    Use timing values from ROADMAP:
    - Micro-interaction: 150ms
    - Hover: 200ms
    - Page transition: 300ms with cubic-bezier(0.4, 0, 0.2, 1)
    - Scroll reveal: 400ms
  </action>
  <verify>
    node -e "const v = require('./components/motion/variants.ts'); console.log('variants loaded')"
    # TypeScript compilation check
    npx tsc --noEmit components/motion/variants.ts 2>&1 | head -20
  </verify>
  <done>
    components/motion/variants.ts exports all variant objects.
    components/motion/index.ts provides clean re-exports.
    TypeScript compiles without errors.
  </done>
</task>

<task type="auto">
  <name>Create scroll reveal hook</name>
  <files>hooks/use-scroll-reveal.ts</files>
  <action>
    Create hooks/ directory (if not exists) and use-scroll-reveal.ts.

    Implement a custom hook that uses Framer Motion's useInView for scroll-triggered animations:

    ```typescript
    "use client";

    import { useInView } from "framer-motion";
    import { useRef, useEffect, useState } from "react";

    interface UseScrollRevealOptions {
      once?: boolean;
      margin?: string;
      amount?: number;
    }

    export function useScrollReveal(options: UseScrollRevealOptions = {}) {
      const { once = true, margin = "-100px", amount = 0.3 } = options;
      const ref = useRef<HTMLDivElement>(null);
      const isInView = useInView(ref, { once, margin, amount });
      const [hasAnimated, setHasAnimated] = useState(false);

      useEffect(() => {
        if (isInView && !hasAnimated) {
          setHasAnimated(true);
        }
      }, [isInView, hasAnimated]);

      return {
        ref,
        isInView: isInView || hasAnimated,
        hasAnimated
      };
    }
    ```

    The hook:
    - Returns a ref to attach to the element
    - Returns isInView boolean for animation state
    - Supports "once" mode (animate only first time)
    - Supports custom margin for early/late triggering
    - Supports amount (how much of element must be visible)
  </action>
  <verify>
    grep -E "useScrollReveal|useInView" hooks/use-scroll-reveal.ts
  </verify>
  <done>
    hooks/use-scroll-reveal.ts exports useScrollReveal hook.
    Hook returns ref, isInView state, and hasAnimated boolean.
  </done>
</task>

<task type="auto">
  <name>Create motion provider with global config</name>
  <files>components/providers/motion-provider.tsx</files>
  <action>
    Create components/providers/motion-provider.tsx with global motion configuration.

    The provider should:
    1. Configure reduced motion support (accessibility)
    2. Set default transition for all animations
    3. Wrap children with LazyMotion for performance

    ```typescript
    "use client";

    import { LazyMotion, domAnimation, m } from "framer-motion";
    import { ReactNode } from "react";

    interface MotionProviderProps {
      children: ReactNode;
    }

    export function MotionProvider({ children }: MotionProviderProps) {
      return (
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      );
    }

    // Export 'm' for reduced bundle size motion components
    export { m };
    ```

    This uses Framer Motion's LazyMotion with domAnimation for:
    - Smaller bundle size (loads animation features on demand)
    - Consistent animation behavior across the app
    - Foundation for reduced-motion support

    Note: The existing providers file is at components/providers/ConvexClientProvider.tsx.
  </action>
  <verify>
    grep -E "MotionProvider|LazyMotion" components/providers/motion-provider.tsx
  </verify>
  <done>
    components/providers/motion-provider.tsx exports MotionProvider.
    Provider wraps children with LazyMotion for performance.
  </done>
</task>

</tasks>

<verification>
1. Animation variants importable: import { fadeVariants, slideVariants } from "@/components/motion"
2. Scroll hook works: import { useScrollReveal } from "@/hooks/use-scroll-reveal"
3. Motion provider wraps: MotionProvider renders without errors
4. TypeScript compiles: npx tsc --noEmit passes
</verification>

<success_criteria>
- [ ] fadeVariants, slideVariants, scaleVariants exported
- [ ] staggerContainer, staggerItem exported for list animations
- [ ] springConfig exported for natural physics
- [ ] useScrollReveal hook returns ref and isInView state
- [ ] MotionProvider wraps app with LazyMotion
- [ ] All imports work with @/ alias
</success_criteria>

<output>
After completion, create `.planning/phases/PHASE-1-design-system/PHASE-1-02-SUMMARY.md`
</output>
