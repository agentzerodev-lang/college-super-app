import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, STAFF_ONLY, ADMIN_ONLY } from "./auth";

export const create = mutation({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    type: v.union(
      v.literal("emergency"),
      v.literal("medical"),
      v.literal("security"),
      v.literal("other")
    ),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    const now = Date.now();
    
    const sosId = await ctx.db.insert("sosAlerts", {
      userId,
      collegeId: args.collegeId,
      type: args.type,
      location: args.location,
      description: args.description,
      status: "active",
      responders: [],
      createdAt: now,
    });
    
    return sosId;
  },
});

export const getById = query({
  args: {
    sosId: v.id("sosAlerts"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.sosId);
  },
});

export const getActiveByCollege = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    return await ctx.db
      .query("sosAlerts")
      .withIndex("by_collegeId_status", (q) => 
        q.eq("collegeId", args.collegeId).eq("status", "active")
      )
      .order("desc")
      .collect();
  },
});

export const getMyAlerts = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    
    return await ctx.db
      .query("sosAlerts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getAllActive = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    return await ctx.db
      .query("sosAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();
  },
});

export const respond = mutation({
  args: {
    clerkUserId: v.string(),
    sosId: v.id("sosAlerts"),
  },
  handler: async (ctx, args) => {
    const userId = requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    const sos = await ctx.db.get(args.sosId);
    if (!sos) {
      throw new Error("SOS alert not found");
    }
    
    if (sos.status !== "active" && sos.status !== "responding") {
      throw new Error("Cannot respond to resolved SOS");
    }
    
    const responders = sos.responders ?? [];
    if (!responders.includes(userId)) {
      responders.push(userId);
    }
    
    await ctx.db.patch(args.sosId, {
      status: "responding",
      responders,
    });
    
    return args.sosId;
  },
});

export const resolve = mutation({
  args: {
    clerkUserId: v.string(),
    sosId: v.id("sosAlerts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const sos = await ctx.db.get(args.sosId);
    if (!sos) {
      throw new Error("SOS alert not found");
    }
    
    const isCreator = sos.userId === userId;
    const isResponder = sos.responders?.includes(userId);
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    
    if (!isCreator && !isResponder && !isStaff) {
      throw new Error("Not authorized to resolve this SOS");
    }
    
    await ctx.db.patch(args.sosId, {
      status: "resolved",
      resolvedAt: Date.now(),
      resolvedBy: userId,
    });
    
    return args.sosId;
  },
});

export const cancel = mutation({
  args: {
    clerkUserId: v.string(),
    sosId: v.id("sosAlerts"),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const sos = await ctx.db.get(args.sosId);
    if (!sos) {
      throw new Error("SOS alert not found");
    }
    
    if (sos.userId !== userId) {
      throw new Error("Only the creator can cancel the SOS");
    }
    
    if (sos.status !== "active") {
      throw new Error("Can only cancel active SOS alerts");
    }
    
    await ctx.db.patch(args.sosId, {
      status: "resolved",
      resolvedAt: Date.now(),
      resolvedBy: userId,
    });
    
    return args.sosId;
  },
});

export const getStats = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    const alerts = await ctx.db
      .query("sosAlerts")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
    
    const stats = {
      total: alerts.length,
      active: alerts.filter((a) => a.status === "active").length,
      responding: alerts.filter((a) => a.status === "responding").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
      byType: {
        emergency: alerts.filter((a) => a.type === "emergency").length,
        medical: alerts.filter((a) => a.type === "medical").length,
        security: alerts.filter((a) => a.type === "security").length,
        other: alerts.filter((a) => a.type === "other").length,
      },
    };
    
    return stats;
  },
});

export const getByStatus = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    status: v.union(
      v.literal("active"),
      v.literal("responding"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    return await ctx.db
      .query("sosAlerts")
      .withIndex("by_collegeId_status", (q) => 
        q.eq("collegeId", args.collegeId).eq("status", args.status)
      )
      .order("desc")
      .collect();
  },
});
