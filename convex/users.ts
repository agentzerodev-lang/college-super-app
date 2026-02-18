import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, hasRole, requireAuth, requireRole, Role, ADMIN_ONLY, STAFF_ONLY, ALL_ROLES } from "./auth";

export const createOrUpdateUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.optional(v.union(
      v.literal("student"),
      v.literal("faculty"),
      v.literal("admin"),
      v.literal("hostelAdmin"),
      v.literal("canteenAdmin")
    )),
    branch: v.optional(v.string()),
    year: v.optional(v.number()),
    hostelId: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        role: args.role ?? existingUser.role,
        branch: args.branch ?? existingUser.branch,
        year: args.year ?? existingUser.year,
        hostelId: args.hostelId ?? existingUser.hostelId,
        phone: args.phone ?? existingUser.phone,
        updatedAt: now,
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      role: args.role ?? "student",
      branch: args.branch,
      year: args.year,
      hostelId: args.hostelId,
      phone: args.phone,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("wallets", {
      userId,
      balance: 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const getUser = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    if (!auth.isAuthenticated) {
      return null;
    }
    return auth.user;
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.userId);
  },
});

export const getAllUsers = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.status === "active");
  },
});

export const getUsersByRole = query({
  args: {
    clerkUserId: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("faculty"),
      v.literal("admin"),
      v.literal("hostelAdmin"),
      v.literal("canteenAdmin")
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    return users.filter((u) => u.status === "active");
  },
});

export const getUsersByBranch = query({
  args: {
    clerkUserId: v.string(),
    branch: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), STAFF_ONLY);
    const users = await ctx.db
      .query("users")
      .withIndex("by_branch", (q) => q.eq("branch", args.branch))
      .collect();
    return users.filter((u) => u.status === "active");
  },
});

export const updateUser = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    branch: v.optional(v.string()),
    year: v.optional(v.number()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.branch !== undefined) updates.branch = args.branch;
    if (args.year !== undefined) updates.year = args.year;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(userId, updates);
    return userId;
  },
});

export const deactivateUser = mutation({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    const now = Date.now();
    await ctx.db.patch(args.targetUserId, {
      status: "inactive",
      updatedAt: now,
    });
    return args.targetUserId;
  },
});
