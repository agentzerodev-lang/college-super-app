import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, STAFF_ONLY, ADMIN_ONLY } from "./auth";

export const createEvent = mutation({
  args: {
    clerkUserId: v.string(),
    title: v.string(),
    description: v.string(),
    collegeId: v.id("colleges"),
    type: v.union(
      v.literal("academic"),
      v.literal("cultural"),
      v.literal("sports"),
      v.literal("workshop"),
      v.literal("seminar"),
      v.literal("competition"),
      v.literal("other")
    ),
    startTime: v.number(),
    endTime: v.number(),
    location: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    maxAttendees: v.optional(v.number()),
    registrationDeadline: v.optional(v.number()),
    isPublic: v.boolean(),
    fee: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const now = Date.now();

    return await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      collegeId: args.collegeId,
      creatorId: userId,
      creatorName: auth.user?.name,
      type: args.type,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      imageUrl: args.imageUrl,
      tags: args.tags,
      maxAttendees: args.maxAttendees,
      registrationDeadline: args.registrationDeadline,
      isPublic: args.isPublic,
      registrationCount: 0,
      status: "active",
      createdAt: now,
    });
  },
});

export const getEventById = query({
  args: {
    eventId: v.id("events"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.eventId);
  },
});

export const getByCollege = query({
  args: {
    collegeId: v.id("colleges"),
    clerkUserId: v.string(),
    type: v.optional(v.union(
      v.literal("academic"),
      v.literal("cultural"),
      v.literal("sports"),
      v.literal("workshop"),
      v.literal("seminar"),
      v.literal("competition"),
      v.literal("other")
    )),
    upcomingOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    const now = Date.now();

    if (args.type) {
      const events = await ctx.db
        .query("events")
        .withIndex("by_collegeId_type", (q) =>
          q.eq("collegeId", args.collegeId).eq("type", args.type)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      if (args.upcomingOnly) {
        return events.filter((e) => e.startTime > now);
      }
      return events;
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (args.upcomingOnly) {
      return events.filter((e) => e.startTime > now);
    }
    return events;
  },
});

export const searchEvents = query({
  args: {
    collegeId: v.id("colleges"),
    searchTerm: v.string(),
    clerkUserId: v.string(),
    type: v.optional(v.union(
      v.literal("academic"),
      v.literal("cultural"),
      v.literal("sports"),
      v.literal("workshop"),
      v.literal("seminar"),
      v.literal("competition"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    if (args.type) {
      return await ctx.db
        .query("events")
        .withSearchIndex("search_events", (q) =>
          q.search("title", args.searchTerm)
            .eq("collegeId", args.collegeId)
            .eq("type", args.type)
        )
        .take(20);
    }

    return await ctx.db
      .query("events")
      .withSearchIndex("search_events", (q) =>
        q.search("title", args.searchTerm).eq("collegeId", args.collegeId)
      )
      .take(20);
  },
});

export const updateEvent = mutation({
  args: {
    clerkUserId: v.string(),
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("academic"),
      v.literal("cultural"),
      v.literal("sports"),
      v.literal("workshop"),
      v.literal("seminar"),
      v.literal("competition"),
      v.literal("other")
    )),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    location: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    maxAttendees: v.optional(v.number()),
    registrationDeadline: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const isCreator = event.creatorId === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);

    if (!isCreator && !isStaff) {
      throw new Error("Not authorized to update this event");
    }

    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.type !== undefined) updates.type = args.type;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;
    if (args.location !== undefined) updates.location = args.location;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.maxAttendees !== undefined) updates.maxAttendees = args.maxAttendees;
    if (args.registrationDeadline !== undefined) updates.registrationDeadline = args.registrationDeadline;
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.eventId, updates);
    return args.eventId;
  },
});

export const deleteEvent = mutation({
  args: {
    clerkUserId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const isCreator = event.creatorId === userId;
    const isAdmin = auth.role === "admin";

    if (!isCreator && !isAdmin) {
      throw new Error("Not authorized to delete this event");
    }

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const reg of registrations) {
      await ctx.db.delete(reg._id);
    }

    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});

export const register = mutation({
  args: {
    clerkUserId: v.string(),
    eventId: v.id("events"),
    paymentStatus: v.optional(v.union(
      v.literal("free"),
      v.literal("pending"),
      v.literal("paid")
    )),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.status !== "active") {
      throw new Error("Event is not available for registration");
    }

    if (event.registrationDeadline && Date.now() > event.registrationDeadline) {
      throw new Error("Registration deadline has passed");
    }

    const existingRegistration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId)
      )
      .first();

    if (existingRegistration) {
      throw new Error("Already registered for this event");
    }

    const isWaitlisted = event.maxAttendees !== undefined &&
      event.registrationCount !== undefined &&
      event.registrationCount >= event.maxAttendees;

    const now = Date.now();

    await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      userId,
      collegeId: event.collegeId,
      status: isWaitlisted ? "waitlisted" : "registered",
      paymentStatus: args.paymentStatus ?? (event.isFree || !event.fee ? "free" : "pending"),
      registeredAt: now,
      notes: args.notes,
      createdAt: now,
    });

    await ctx.db.patch(args.eventId, {
      registrationCount: (event.registrationCount ?? 0) + 1,
    });

    return { eventId: args.eventId, isWaitlisted };
  },
});

export const cancelRegistration = mutation({
  args: {
    clerkUserId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId)
      )
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.status === "cancelled") {
      throw new Error("Registration already cancelled");
    }

    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    const isSelf = registration.userId === userId;

    if (!isSelf && !isStaff) {
      throw new Error("Not authorized to cancel this registration");
    }

    await ctx.db.patch(registration._id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    await ctx.db.patch(args.eventId, {
      registrationCount: Math.max((event.registrationCount ?? 1) - 1, 0),
    });

    if (event.maxAttendees !== undefined && event.registrationCount !== undefined) {
      if (event.registrationCount >= event.maxAttendees) {
        const waitlisted = await ctx.db
          .query("eventRegistrations")
          .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
          .filter((q) => q.eq(q.field("status"), "waitlisted"))
          .order("asc")
          .first();

        if (waitlisted) {
          await ctx.db.patch(waitlisted._id, {
            status: "registered",
          });
        }
      }
    }

    return registration._id;
  },
});

export const getMyRegistrations = query({
  args: {
    clerkUserId: v.string(),
    status: v.optional(v.union(
      v.literal("registered"),
      v.literal("waitlisted"),
      v.literal("attended"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (args.status) {
      return registrations.filter((r) => r.status === args.status);
    }

    return registrations.filter((r) => r.status !== "cancelled");
  },
});

export const getEventRegistrations = query({
  args: {
    eventId: v.id("events"),
    clerkUserId: v.string(),
    status: v.optional(v.union(
      v.literal("registered"),
      v.literal("waitlisted"),
      v.literal("attended"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const isCreator = event.creatorId === auth.userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);

    if (!isCreator && !isStaff) {
      throw new Error("Not authorized to view registrations");
    }

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    if (args.status) {
      return registrations.filter((r) => r.status === args.status);
    }

    return registrations;
  },
});

export const markAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    eventId: v.id("events"),
    userId: v.id("users"),
    attended: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const isCreator = event.creatorId === auth.userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);

    if (!isCreator && !isStaff) {
      throw new Error("Not authorized to mark attendance");
    }

    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    await ctx.db.patch(registration._id, {
      status: args.attended ? "attended" : "registered",
    });

    return registration._id;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    clerkUserId: v.string(),
    registrationId: v.id("eventRegistrations"),
    paymentStatus: v.union(
      v.literal("free"),
      v.literal("pending"),
      v.literal("paid")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const isCreator = event.creatorId === auth.userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    const isSelf = registration.userId === auth.userId;

    if (!isCreator && !isStaff && !isSelf) {
      throw new Error("Not authorized to update payment status");
    }

    await ctx.db.patch(args.registrationId, {
      paymentStatus: args.paymentStatus,
    });

    return args.registrationId;
  },
});

export const getEventsByCreator = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));

    return await ctx.db
      .query("events")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", userId))
      .order("desc")
      .collect();
  },
});

export const getRegistrationStats = query({
  args: {
    eventId: v.id("events"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const isCreator = event.creatorId === auth.userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);

    if (!isCreator && !isStaff) {
      throw new Error("Not authorized to view stats");
    }

    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      total: registrations.length,
      registered: registrations.filter((r) => r.status === "registered").length,
      waitlisted: registrations.filter((r) => r.status === "waitlisted").length,
      attended: registrations.filter((r) => r.status === "attended").length,
      cancelled: registrations.filter((r) => r.status === "cancelled").length,
      spotsRemaining: event.maxAttendees
        ? Math.max(event.maxAttendees - registrations.filter((r) =>
          r.status === "registered" || r.status === "waitlisted"
        ).length, 0)
        : null,
    };
  },
});

export const getUpcoming = query({
  args: {
    collegeId: v.id("colleges"),
    clerkUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    const now = Date.now();
    const limit = args.limit ?? 10;

    return await ctx.db
      .query("events")
      .withIndex("by_collegeId_startTime", (q) =>
        q.eq("collegeId", args.collegeId).gt("startTime", now)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(limit);
  },
});
