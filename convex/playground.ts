import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, STAFF_ONLY, ADMIN_ONLY } from "./auth";

export const createPlayground = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("cricket"),
      v.literal("football"),
      v.literal("basketball"),
      v.literal("tennis"),
      v.literal("badminton"),
      v.literal("volleyball"),
      v.literal("gym"),
      v.literal("swimming"),
      v.literal("other")
    ),
    collegeId: v.id("colleges"),
    location: v.optional(v.string()),
    capacity: v.number(),
    facilities: v.optional(v.array(v.string())),
    rules: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    const now = Date.now();

    return await ctx.db.insert("playgrounds", {
      name: args.name,
      type: args.type,
      collegeId: args.collegeId,
      location: args.location,
      capacity: args.capacity,
      facilities: args.facilities,
      rules: args.rules,
      imageUrl: args.imageUrl,
      status: "active",
      createdAt: now,
    });
  },
});

export const getPlaygroundById = query({
  args: {
    playgroundId: v.id("playgrounds"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.playgroundId);
  },
});

export const getByCollege = query({
  args: {
    collegeId: v.id("colleges"),
    clerkUserId: v.string(),
    type: v.optional(v.union(
      v.literal("cricket"),
      v.literal("football"),
      v.literal("basketball"),
      v.literal("tennis"),
      v.literal("badminton"),
      v.literal("volleyball"),
      v.literal("gym"),
      v.literal("swimming"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    if (args.type) {
      return await ctx.db
        .query("playgrounds")
        .withIndex("by_collegeId_type", (q) =>
          q.eq("collegeId", args.collegeId).eq("type", args.type)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    }

    return await ctx.db
      .query("playgrounds")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const updatePlayground = mutation({
  args: {
    clerkUserId: v.string(),
    playgroundId: v.id("playgrounds"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    capacity: v.optional(v.number()),
    facilities: v.optional(v.array(v.string())),
    rules: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);

    const playground = await ctx.db.get(args.playgroundId);
    if (!playground) {
      throw new Error("Playground not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.location !== undefined) updates.location = args.location;
    if (args.capacity !== undefined) updates.capacity = args.capacity;
    if (args.facilities !== undefined) updates.facilities = args.facilities;
    if (args.rules !== undefined) updates.rules = args.rules;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.playgroundId, updates);
    return args.playgroundId;
  },
});

export const createSlots = mutation({
  args: {
    clerkUserId: v.string(),
    playgroundId: v.id("playgrounds"),
    collegeId: v.id("colleges"),
    date: v.number(),
    slots: v.array(v.object({
      startTime: v.string(),
      endTime: v.string(),
      maxParticipants: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);

    const playground = await ctx.db.get(args.playgroundId);
    if (!playground) {
      throw new Error("Playground not found");
    }

    const now = Date.now();
    const createdIds = [];

    for (const slot of args.slots) {
      const existing = await ctx.db
        .query("playgroundSlots")
        .withIndex("by_playgroundId_date", (q) =>
          q.eq("playgroundId", args.playgroundId).eq("date", args.date)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("startTime"), slot.startTime),
            q.eq(q.field("endTime"), slot.endTime)
          )
        )
        .first();

      if (existing) {
        continue;
      }

      const slotId = await ctx.db.insert("playgroundSlots", {
        playgroundId: args.playgroundId,
        collegeId: args.collegeId,
        date: args.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false,
        maxParticipants: slot.maxParticipants ?? playground.capacity,
        currentParticipants: 0,
        status: "available",
        createdAt: now,
      });
      createdIds.push(slotId);
    }

    return createdIds;
  },
});

export const getSlotsByPlayground = query({
  args: {
    playgroundId: v.id("playgrounds"),
    date: v.number(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    return await ctx.db
      .query("playgroundSlots")
      .withIndex("by_playgroundId_date", (q) =>
        q.eq("playgroundId", args.playgroundId).eq("date", args.date)
      )
      .collect();
  },
});

export const getSlotsByCollege = query({
  args: {
    collegeId: v.id("colleges"),
    date: v.number(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    return await ctx.db
      .query("playgroundSlots")
      .withIndex("by_collegeId_date", (q) =>
        q.eq("collegeId", args.collegeId).eq("date", args.date)
      )
      .collect();
  },
});

export const bookSlot = mutation({
  args: {
    clerkUserId: v.string(),
    slotId: v.id("playgroundSlots"),
    bookedFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.isBooked && slot.bookedBy && slot.bookedBy !== userId) {
      throw new Error("Slot is already booked by another user");
    }

    if (slot.currentParticipants && slot.maxParticipants) {
      if (slot.currentParticipants >= slot.maxParticipants) {
        throw new Error("Slot has reached maximum participants");
      }
    }

    await ctx.db.patch(args.slotId, {
      bookedBy: userId,
      bookedFor: args.bookedFor,
      isBooked: true,
      currentParticipants: (slot.currentParticipants ?? 0) + 1,
      status: "booked",
    });

    return args.slotId;
  },
});

export const joinSlot = mutation({
  args: {
    clerkUserId: v.string(),
    slotId: v.id("playgroundSlots"),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (!slot.isBooked) {
      throw new Error("Slot must be booked first");
    }

    if (slot.currentParticipants && slot.maxParticipants) {
      if (slot.currentParticipants >= slot.maxParticipants) {
        throw new Error("Slot has reached maximum participants");
      }
    }

    await ctx.db.patch(args.slotId, {
      currentParticipants: (slot.currentParticipants ?? 0) + 1,
    });

    return args.slotId;
  },
});

export const cancelBooking = mutation({
  args: {
    clerkUserId: v.string(),
    slotId: v.id("playgroundSlots"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const isBooker = slot.bookedBy === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);

    if (!isBooker && !isStaff) {
      throw new Error("Not authorized to cancel this booking");
    }

    await ctx.db.patch(args.slotId, {
      bookedBy: undefined,
      bookedFor: undefined,
      isBooked: false,
      currentParticipants: 0,
      status: "available",
    });

    return args.slotId;
  },
});

export const leaveSlot = mutation({
  args: {
    clerkUserId: v.string(),
    slotId: v.id("playgroundSlots"),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.currentParticipants && slot.currentParticipants > 0) {
      await ctx.db.patch(args.slotId, {
        currentParticipants: slot.currentParticipants - 1,
      });
    }

    return args.slotId;
  },
});

export const getMyBookings = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    return await ctx.db
      .query("playgroundSlots")
      .withIndex("by_bookedBy", (q) => q.eq("bookedBy", userId))
      .order("desc")
      .collect();
  },
});

export const updateSlotStatus = mutation({
  args: {
    clerkUserId: v.string(),
    slotId: v.id("playgroundSlots"),
    status: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.maxParticipants !== undefined) updates.maxParticipants = args.maxParticipants;

    await ctx.db.patch(args.slotId, updates);
    return args.slotId;
  },
});

export const deleteSlot = mutation({
  args: {
    clerkUserId: v.string(),
    slotId: v.id("playgroundSlots"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);

    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.isBooked) {
      throw new Error("Cannot delete a booked slot");
    }

    await ctx.db.delete(args.slotId);
    return args.slotId;
  },
});

export const getAvailableSlots = query({
  args: {
    collegeId: v.id("colleges"),
    date: v.number(),
    playgroundType: v.optional(v.union(
      v.literal("cricket"),
      v.literal("football"),
      v.literal("basketball"),
      v.literal("tennis"),
      v.literal("badminton"),
      v.literal("volleyball"),
      v.literal("gym"),
      v.literal("swimming"),
      v.literal("other")
    )),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    const slots = await ctx.db
      .query("playgroundSlots")
      .withIndex("by_collegeId_date", (q) =>
        q.eq("collegeId", args.collegeId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    if (!args.playgroundType) {
      return slots;
    }

    const filteredSlots = [];
    for (const slot of slots) {
      const playground = await ctx.db.get(slot.playgroundId);
      if (playground && playground.type === args.playgroundType) {
        filteredSlots.push({ ...slot, playground });
      }
    }

    return filteredSlots;
  },
});
