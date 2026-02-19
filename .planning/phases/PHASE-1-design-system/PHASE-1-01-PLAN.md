---
phase: PHASE-1-design-system
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - lib/utils.ts
  - tailwind.config.ts
autonomous: true
requirements:
  - DSYS-01
  - DSYS-06
must_haves:
  truths:
    - "Developers can import cn() helper for conditional class merging"
    - "Tailwind config contains dark-first design tokens (colors, spacing, typography)"
    - "All 3 packages are installed and importable"
  artifacts:
    - path: "lib/utils.ts"
      provides: "cn() class merging utility"
      exports: ["cn"]
      min_lines: 10
    - path: "tailwind.config.ts"
      provides: "Design tokens for premium dark theme"
      contains: "glass, bg-primary, bg-secondary"
    - path: "package.json"
      provides: "Dependencies"
      contains: "framer-motion"
  key_links:
    - from: "tailwind.config.ts"
      to: "all UI components"
      via: "Tailwind class names"
      pattern: "bg-primary|glass|text-primary"
---

<objective>
Install foundation dependencies and establish the premium dark-first design token system.

Purpose: Create the base layer that all subsequent UI components will depend on. The cn() utility enables safe class merging, and design tokens ensure visual consistency across the app.
Output: Installed packages, cn() utility, extended Tailwind config with glassmorphism tokens.
</objective>

<execution_context>
@/home/dev/.config/opencode/get-shit-done/workflows/execute-plan.md
@/home/dev/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Existing tailwind config (to extend, not replace)
@tailwind.config.ts
</context>

<tasks>

<task type="auto">
  <name>Install foundation dependencies</name>
  <files>package.json</files>
  <action>
    Install the following packages:
    - framer-motion (^11.0.0) - Animation library for page transitions, scroll reveals, micro-interactions
    - clsx (^2.1.0) - Utility for constructing className strings conditionally
    - tailwind-merge (^2.2.0) - Merge Tailwind classes without style conflicts

    Run: npm install framer-motion clsx tailwind-merge

    Do NOT install @radix-ui/colors yet (deferred to future phase if needed).
  </action>
  <verify>
    node -e "console.log(require('./package.json').dependencies)" | grep -E "framer-motion|clsx|tailwind-merge"
  </verify>
  <done>
    package.json lists framer-motion, clsx, and tailwind-merge in dependencies.
    node_modules contains all three packages.
  </done>
</task>

<task type="auto">
  <name>Create cn() utility function</name>
  <files>lib/utils.ts</files>
  <action>
    Create lib/utils.ts with the cn() helper function that combines clsx and tailwind-merge.

    Implementation:
    ```typescript
    import { clsx, type ClassValue } from "clsx";
    import { twMerge } from "tailwind-merge";

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }
    ```

    This function:
    - Accepts any number of class values (strings, arrays, objects)
    - Uses clsx to construct the class string
    - Uses tailwind-merge to resolve conflicting Tailwind classes (e.g., cn("p-4", "p-2") → "p-2")

    Create the lib/ directory if it doesn't exist (it currently only has auth.ts).
  </action>
  <verify>
    node -e "const { cn } = require('./lib/utils'); console.log(cn('p-4', 'p-2'))"
    # Should output: p-2
  </verify>
  <done>
    lib/utils.ts exports cn function.
    cn() correctly merges and deduplicates Tailwind classes.
  </done>
</task>

<task type="auto">
  <name>Extend Tailwind config with dark-first design tokens</name>
  <files>tailwind.config.ts</files>
  <action>
    Extend the existing tailwind.config.ts with premium dark-theme design tokens. PRESERVE all existing config, only ADD new tokens.

    Add to theme.extend:

    1. **Colors** (dark-first palette):
       - bg-primary: #0A0A0F (main dark background)
       - bg-secondary: #12121A (elevated surfaces)
       - bg-tertiary: #1A1A24 (cards, modals)
       - glass: rgba values for glassmorphism effects

    2. **Box Shadow** (premium shadows for dark theme):
       - glow-primary: indigo glow effect
       - glow-accent: teal glow effect
       - glass: subtle glass shadow

    3. **Backdrop Blur** (for glassmorphism):
       - glass: 20px

    4. **Animation** (extend existing):
       - shimmer: for skeleton loaders
       - pulse-glow: for attention-grabbing elements

    5. **Typography** (if not already well-defined):
       - Ensure confident sizing scale

    Reference colors from ROADMAP.md Design Reference section:
    - --bg-primary: #0A0A0F
    - --bg-secondary: #12121A
    - --glass-bg: rgba(255, 255, 255, 0.03)
    - --glass-border: rgba(255, 255, 255, 0.08)
  </action>
  <verify>
    npx tailwindcss --help && echo "Tailwind OK"
    grep -E "bg-primary|glass|glow" tailwind.config.ts
  </verify>
  <done>
    tailwind.config.ts contains dark-first color tokens.
    Glassmorphism utilities (backdrop-blur, glass colors) available.
    Glow shadow utilities defined for premium button effects.
    Existing config preserved and extended.
  </done>
</task>

</tasks>

<verification>
1. All three packages installable: npm ls framer-motion clsx tailwind-merge
2. cn() utility works: import { cn } from "@/lib/utils" succeeds
3. Tailwind builds: npm run build succeeds without errors
4. Design tokens usable: Classes like bg-primary, backdrop-blur-glass work
</verification>

<success_criteria>
- [ ] framer-motion, clsx, tailwind-merge in package.json dependencies
- [ ] lib/utils.ts exports working cn() function
- [ ] tailwind.config.ts extended with dark-first design tokens
- [ ] No build errors after changes
- [ ] Glassmorphism color utilities available (bg-glass, border-glass)
</success_criteria>

<output>
After completion, create `.planning/phases/PHASE-1-design-system/PHASE-1-01-SUMMARY.md`
</output>
