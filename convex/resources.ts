import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, STAFF_ONLY } from "./auth";

export const create = mutation({
  args: {
    clerkUserId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("document"),
      v.literal("video"),
      v.literal("link"),
      v.literal("image"),
      v.literal("other")
    ),
    url: v.string(),
    courseId: v.optional(v.id("courses")),
    collegeId: v.id("colleges"),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    const now = Date.now();
    
    const resourceId = await ctx.db.insert("resources", {
      title: args.title,
      description: args.description,
      type: args.type,
      url: args.url,
      courseId: args.courseId,
      uploadedBy: userId,
      collegeId: args.collegeId,
      tags: args.tags,
      downloadCount: 0,
      status: "active",
      createdAt: now,
    });
    
    return resourceId;
  },
});

export const getById = query({
  args: {
    resourceId: v.id("resources"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.resourceId);
  },
});

export const getByCollege = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("resources")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const getByCourse = query({
  args: {
    clerkUserId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("resources")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const getByType = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    type: v.union(
      v.literal("document"),
      v.literal("video"),
      v.literal("link"),
      v.literal("image"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("resources")
      .withIndex("by_collegeId_type", (q) => 
        q.eq("collegeId", args.collegeId).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const search = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    searchTerm: v.string(),
    type: v.optional(v.union(
      v.literal("document"),
      v.literal("video"),
      v.literal("link"),
      v.literal("image"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const query = ctx.db
      .query("resources")
      .withSearchIndex("search_resources", (q) => {
        if (args.type) {
          return q
            .search("title", args.searchTerm)
            .eq("collegeId", args.collegeId)
            .eq("type", args.type);
        }
        return q
          .search("title", args.searchTerm)
          .eq("collegeId", args.collegeId);
      });
    
    const results = await query.take(50);
    return results.filter((r) => r.status === "active");
  },
});

export const update = mutation({
  args: {
    clerkUserId: v.string(),
    resourceId: v.id("resources"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("document"),
      v.literal("video"),
      v.literal("link"),
      v.literal("image"),
      v.literal("other")
    )),
    url: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    const isOwner = resource.uploadedBy === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    
    if (!isOwner && !isStaff) {
      throw new Error("Not authorized to update this resource");
    }
    
    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.type !== undefined) updates.type = args.type;
    if (args.url !== undefined) updates.url = args.url;
    if (args.tags !== undefined) updates.tags = args.tags;
    
    await ctx.db.patch(args.resourceId, updates);
    return args.resourceId;
  },
});

export const remove = mutation({
  args: {
    clerkUserId: v.string(),
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    const isOwner = resource.uploadedBy === userId;
    const isStaff = auth.role && STAFF_ONLY.includes(auth.role);
    
    if (!isOwner && !isStaff) {
      throw new Error("Not authorized to delete this resource");
    }
    
    await ctx.db.patch(args.resourceId, { status: "deleted" });
    return args.resourceId;
  },
});

export const incrementDownload = mutation({
  args: {
    clerkUserId: v.string(),
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    
    const currentCount = resource.downloadCount ?? 0;
    await ctx.db.patch(args.resourceId, { downloadCount: currentCount + 1 });
    
    return currentCount + 1;
  },
});

export const getMyUploads = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("resources")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const getPopular = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    const limit = args.limit ?? 10;
    return resources
      .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
      .slice(0, limit);
  },
});
