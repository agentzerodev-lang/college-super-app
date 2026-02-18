# Convex + Next.js Best Practices for College Super-App

## Table of Contents
1. [Convex Schema Design](#1-convex-schema-design)
2. [Clerk + Convex Integration](#2-clerk--convex-integration)
3. [Next.js App Router Architecture](#3-nextjs-app-router-architecture)
4. [Common Pitfalls & Gotchas](#4-common-pitfalls--gotchas)

---

## 1. Convex Schema Design

### Flat Schemas vs Nested Data

**Recommendation: Prefer flat schemas with strategic denormalization**

Convex works best with relatively flat document structures. Unlike SQL, you can embed arrays and objects, but there are trade-offs:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core user table - multi-tenant aware
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("faculty"), v.literal("admin")),
    collegeId: v.id("colleges"),
    departmentId: v.optional(v.id("departments")),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_role", ["collegeId", "role"]),

  // Colleges (tenants)
  colleges: defineTable({
    name: v.string(),
    subdomain: v.string(),
    settings: v.object({
      theme: v.optional(v.string()),
      features: v.array(v.string()),
    }),
  }).index("by_subdomain", ["subdomain"]),

  // Departments within a college
  departments: defineTable({
    name: v.string(),
    code: v.string(),
    collegeId: v.id("colleges"),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_code", ["collegeId", "code"]),

  // Events - flat with denormalized data
  events: defineTable({
    title: v.string(),
    description: v.string(),
    collegeId: v.id("colleges"),
    creatorId: v.id("users"),
    // Denormalize for quick display
    creatorName: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    location: v.optional(v.string()),
    tags: v.array(v.string()),
    rsvpCount: v.number(), // Denormalized count
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_startTime", ["collegeId", "startTime"])
    .searchIndex("search_events", {
      searchField: "title",
      filterFields: ["collegeId"],
    }),

  // RSVPs - separate table for many-to-many
  rsvps: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(v.literal("attending"), v.literal("maybe"), v.literal("declined")),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId", ["userId"])
    .index("by_eventId_userId", ["eventId", "userId"]),
});
```

### Indexing Strategies

**Key principles:**

1. **Always index filter fields** - Convex has no query planner; indexes are explicit
2. **Equality predicates first** in composite indexes
3. **Avoid redundant indexes** - `by_collegeId` is redundant if you have `by_collegeId_startTime`

```typescript
// Good: Index for common query pattern
.index("by_collegeId_role", ["collegeId", "role"])

// Query that uses the index
await ctx.db
  .query("users")
  .withIndex("by_collegeId_role", q => 
    q.eq("collegeId", collegeId).eq("role", "student")
  )
  .collect();
```

### Denormalization Patterns

**When to denormalize:**
- Frequently displayed data (creator name on events)
- Counters (rsvpCount, commentCount)
- Data that rarely changes relative to read frequency

**Use database triggers or aggregates for counters:**

```typescript
// convex/rsvps.ts
export const create = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // Create RSVP
    const rsvpId = await ctx.db.insert("rsvps", {
      eventId: args.eventId,
      userId,
      status: "attending",
    });
    
    // Update denormalized counter
    const event = await ctx.db.get(args.eventId);
    await ctx.db.patch(args.eventId, {
      rsvpCount: (event?.rsvpCount ?? 0) + 1,
    });
    
    return rsvpId;
  },
});
```

---

## 2. Clerk + Convex Integration

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Clerk     │────▶│   Next.js   │────▶│   Convex    │
│  (Auth)     │     │  (Frontend) │     │  (Backend)  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │   JWT Token       │                   │
      │──────────────────▶│                   │
      │                   │   Token in        │
      │                   │   Authorization   │
      │                   │──────────────────▶│
      │                   │                   │
      │                   │   ctx.auth.       │
      │                   │   getUserIdentity │
      │                   │◀──────────────────│
```

### Setup Configuration

**1. Clerk JWT Template (Dashboard):**

```json
{
  "sub": "{{user.id}}",
  "aud": "convex",
  "name": "{{user.full_name}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}"
}
```

**2. Convex Auth Config:**

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL!,
      applicationID: "convex",
    },
  ],
};
```

**3. Next.js Provider Setup:**

```typescript
// app/ConvexClientProvider.tsx
"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Role Management Pattern

**Store roles in both Clerk metadata AND Convex:**

```typescript
// convex/users.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to get current user
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", q => q.eq("clerkId", identity.subject))
    .unique();
}

// Sync user from Clerk on first mutation
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existing = await getCurrentUser(ctx);
    if (existing) return existing;
    
    // Get role from JWT claims (set via Clerk public_metadata)
    const role = (identity as any).role || "student";
    
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      name: identity.name,
      role,
      collegeId: identity.tokenIdentifier.includes("college:") 
        ? identity.tokenIdentifier.split(":")[1] as Id<"colleges">
        : null, // Handle college assignment
      createdAt: Date.now(),
    });
  },
});

// Role-based query wrapper
export function authenticatedQuery<Args, Output>(
  config: {
    args: Args;
    handler: (ctx: QueryCtx, args: Args, user: Doc<"users">) => Promise<Output>;
  }
) {
  return query({
    args: config.args,
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Not authenticated");
      return config.handler(ctx, args, user);
    },
  });
}
```

### Protected Routes (Next.js Middleware)

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## 3. Next.js App Router Architecture

### Server vs Client Components for Convex

**Decision matrix:**

| Use Case | Component Type | Data Fetching Method |
|----------|---------------|---------------------|
| Initial page load SEO | Server | `preloadQuery` |
| Real-time data | Client | `useQuery` |
| Static content | Server | `fetchQuery` |
| Interactive UI | Client | `useMutation` |
| Auth-protected content | Client | `Authenticated` wrapper |

### Server-Side Data Preloading

```typescript
// app/events/page.tsx (Server Component)
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { EventsList } from "./EventsList";

export default async function EventsPage() {
  // Preload data on server for SEO + fast initial load
  const preloadedEvents = await preloadQuery(api.events.list, {
    collegeId: "college_123",
  });
  
  return <EventsList preloadedEvents={preloadedEvents} />;
}
```

```typescript
// app/events/EventsList.tsx (Client Component)
"use client";

import { usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EventsList({ preloadedEvents }: { 
  preloadedEvents: Preloaded<typeof api.events.list>;
}) {
  // Hydrates from preloaded data, then stays reactive
  const events = usePreloadedQuery(preloadedEvents);
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
```

### Client-Side Data Fetching

```typescript
// app/dashboard/Dashboard.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export function Dashboard() {
  return (
    <>
      <AuthLoading>
        <DashboardSkeleton />
      </AuthLoading>
      
      <Unauthenticated>
        <SignInPrompt />
      </Unauthenticated>
      
      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </>
  );
}

function DashboardContent() {
  const events = useQuery(api.events.list, { collegeId: "college_123" });
  const createEvent = useMutation(api.events.create);
  
  if (events === undefined) return <DashboardSkeleton />;
  
  return (
    <div>
      {/* Interactive content */}
    </div>
  );
}
```

### Server Actions for Mutations

```typescript
// app/actions/events.ts
"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  await fetchMutation(api.events.create, {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    // ... other fields
  });
  
  revalidatePath("/events");
}
```

### Recommended Project Structure

```
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/
│   ├── events/
│   │   ├── page.tsx           # Server component, preloads
│   │   ├── EventsList.tsx     # Client component, reactive
│   │   └── [id]/
│   │       └── page.tsx
│   ├── forum/
│   └── profile/
├── api/
│   └── webhooks/
│       └── clerk/route.ts
├── ConvexClientProvider.tsx   # Client component
├── layout.tsx                 # Server component
└── page.tsx

convex/
├── _generated/
├── auth.config.ts
├── schema.ts
├── users.ts
├── events.ts
├── forum.ts
└── model/                     # Shared helper functions
    ├── users.ts
    └── auth.ts
```

---

## 4. Common Pitfalls & Gotchas

### Query Performance

| ❌ Anti-Pattern | ✅ Best Practice |
|----------------|-----------------|
| `.filter()` without index | `.withIndex()` with proper fields |
| `.collect()` on large results | `.paginate()` or `.take(n)` |
| Fetching all then filtering in JS | Filter in query with index |
| Multiple sequential queries | Parallel queries with `Promise.all` |
| No pagination on lists | Always paginate for unbounded data |

```typescript
// ❌ BAD: Full table scan
const events = await ctx.db
  .query("events")
  .filter(q => q.eq(q.field("collegeId"), collegeId))
  .collect();

// ✅ GOOD: Indexed query
const events = await ctx.db
  .query("events")
  .withIndex("by_collegeId", q => q.eq("collegeId", collegeId))
  .collect();

// ❌ BAD: Loading all 10,000+ documents
const allMessages = await ctx.db.query("messages").collect();

// ✅ GOOD: Pagination
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channelId", q => q.eq("channelId", channelId))
  .paginate(opts.cursor, 50);
```

### Authentication Pitfalls

| Pitfall | Solution |
|---------|----------|
| Using `useAuth()` from Clerk | Use `useConvexAuth()` for Convex queries |
| Not checking auth in every function | Use wrapper functions or RLS |
| Storing userId as argument | Get from `ctx.auth.getUserIdentity()` |
| Race conditions on first load | Use `AuthLoading` component |

```typescript
// ❌ BAD: Trusting client-provided userId
export const updateProfile = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { name: args.name });
  },
});

// ✅ GOOD: Get userId from auth
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    await ctx.db.patch(user._id, { name: args.name });
  },
});
```

### Schema Mistakes

| Pitfall | Solution |
|---------|----------|
| Deeply nested arrays | Flatten to separate tables |
| Missing indexes on foreign keys | Always index `Id` fields used in queries |
| Over-normalization | Denormalize frequently accessed fields |
| Storing large objects | Use file storage for blobs |

### React/Next.js Integration Issues

| Issue | Solution |
|-------|----------|
| `useQuery` in Server Component | Use `preloadQuery` or move to Client |
| Stale data after mutation | Mutation auto-invalidates, check query key |
| Flash of loading state | Use `AuthLoading` + Suspense |
| Hydration mismatch | Ensure single `ConvexReactClient` instance |

### Multi-Tenancy Gotchas

```typescript
// Always filter by collegeId in queries
export const list = query({
  args: { collegeId: v.id("colleges") },
  handler: async (ctx, args) => {
    // NEVER skip this filter - data isolation is critical
    return ctx.db
      .query("events")
      .withIndex("by_collegeId", q => q.eq("collegeId", args.collegeId))
      .collect();
  },
});

// Store collegeId in JWT claims for automatic filtering
// Clerk public_metadata: { collegeId: "xxx" }
```

### Key Convex Limits to Know

| Limit | Value | Mitigation |
|-------|-------|------------|
| Max documents read per query | 10,000 | Pagination |
| Max document size | 1 MB | File storage |
| Function timeout | 5 minutes (actions) | Background jobs |
| Indexed fields per table | 32 | Consolidate indexes |
| Arguments per function | ~1MB total | Chunk large data |

---

## Quick Reference Checklist

### Before Deploying:
- [ ] All queries use `.withIndex()` (no `.filter()` alone)
- [ ] Large lists use pagination
- [ ] Auth checked in every public function
- [ ] `useConvexAuth()` used for auth state (not Clerk's `useAuth`)
- [ ] Multi-tenant data filtered by `collegeId`
- [ ] Counters/derived data denormalized
- [ ] `ConvexProviderWithClerk` wraps app
- [ ] JWT template configured in Clerk
- [ ] Middleware protects private routes

### Schema Review:
- [ ] Indexes on all foreign keys (`Id` fields)
- [ ] Composite indexes for common query patterns
- [ ] Search indexes for text search
- [ ] No redundant indexes
- [ ] Denormalized frequently displayed fields

---

*Research compiled from Convex documentation, community best practices, and real-world patterns.*
