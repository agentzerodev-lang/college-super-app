import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, STAFF_ONLY, ADMIN_ONLY } from "./auth";

export const create = mutation({
  args: {
    clerkUserId: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("technical"),
      v.literal("academic"),
      v.literal("facility"),
      v.literal("hostel"),
      v.literal("other")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    const now = Date.now();
    
    const ticketId = await ctx.db.insert("tickets", {
      title: args.title,
      description: args.description,
      category: args.category,
      priority: args.priority,
      status: "open",
      createdBy: userId,
      collegeId: args.collegeId,
      createdAt: now,
    });
    
    return ticketId;
  },
});

export const getById = query({
  args: {
    ticketId: v.id("tickets"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.ticketId);
  },
});

export const getByCollege = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    category: v.optional(v.union(
      v.literal("technical"),
      v.literal("academic"),
      v.literal("facility"),
      v.literal("hostel"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const status = args.status;
    const category = args.category;
    
    if (status) {
      return await ctx.db
        .query("tickets")
        .withIndex("by_collegeId_status", (q) => 
          q.eq("collegeId", args.collegeId).eq("status", status)
        )
        .collect();
    }
    
    if (category) {
      return await ctx.db
        .query("tickets")
        .withIndex("by_collegeId_category", (q) => 
          q.eq("collegeId", args.collegeId).eq("category", category)
        )
        .collect();
    }
    
    return await ctx.db
      .query("tickets")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
  },
});

export const getMyTickets = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("tickets")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();
  },
});

export const getAssignedToMe = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("tickets")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", userId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    clerkUserId: v.string(),
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    const isCreator = ticket.createdBy === userId;
    const isAssigned = ticket.assignedTo === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    
    if (!isCreator && !isAssigned && !isStaff) {
      throw new Error("Not authorized to update this ticket");
    }
    
    const updates: Record<string, unknown> = { status: args.status };
    
    if (args.status === "resolved") {
      updates.resolvedAt = Date.now();
    }
    
    await ctx.db.patch(args.ticketId, updates);
    return args.ticketId;
  },
});

export const assign = mutation({
  args: {
    clerkUserId: v.string(),
    ticketId: v.id("tickets"),
    assignToUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    await ctx.db.patch(args.ticketId, {
      assignedTo: args.assignToUserId,
      status: "in_progress",
    });
    
    return args.ticketId;
  },
});

export const updatePriority = mutation({
  args: {
    clerkUserId: v.string(),
    ticketId: v.id("tickets"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    const isCreator = ticket.createdBy === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    
    if (!isCreator && !isStaff) {
      throw new Error("Not authorized to update ticket priority");
    }
    
    await ctx.db.patch(args.ticketId, { priority: args.priority });
    return args.ticketId;
  },
});

export const update = mutation({
  args: {
    clerkUserId: v.string(),
    ticketId: v.id("tickets"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("technical"),
      v.literal("academic"),
      v.literal("facility"),
      v.literal("hostel"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    const isCreator = ticket.createdBy === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    
    if (!isCreator && !isStaff) {
      throw new Error("Not authorized to update this ticket");
    }
    
    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    
    await ctx.db.patch(args.ticketId, updates);
    return args.ticketId;
  },
});

export const getStats = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
    
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
      byCategory: {
        technical: tickets.filter((t) => t.category === "technical").length,
        academic: tickets.filter((t) => t.category === "academic").length,
        facility: tickets.filter((t) => t.category === "facility").length,
        hostel: tickets.filter((t) => t.category === "hostel").length,
        other: tickets.filter((t) => t.category === "other").length,
      },
      byPriority: {
        low: tickets.filter((t) => t.priority === "low").length,
        medium: tickets.filter((t) => t.priority === "medium").length,
        high: tickets.filter((t) => t.priority === "high").length,
        urgent: tickets.filter((t) => t.priority === "urgent").length,
      },
    };
    
    return stats;
  },
});

export const reopen = mutation({
  args: {
    clerkUserId: v.string(),
    ticketId: v.id("tickets"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    if (ticket.createdBy !== userId) {
      throw new Error("Only ticket creator can reopen");
    }
    
    if (ticket.status !== "closed" && ticket.status !== "resolved") {
      throw new Error("Can only reopen closed or resolved tickets");
    }
    
    const updates: Record<string, unknown> = {
      status: "open",
      resolvedAt: undefined,
    };
    
    await ctx.db.patch(args.ticketId, updates);
    return args.ticketId;
  },
});
