import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, HOSTEL_ADMIN, ALL_ROLES } from "./auth";

export const getHostels = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("hostels")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
  },
});

export const getHostelById = query({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.hostelId);
  },
});

export const getMealsByHostel = query({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const query = ctx.db
      .query("hostelMeals")
      .withIndex("by_hostelId", (q) => q.eq("hostelId", args.hostelId));
    
    const meals = await query.collect();
    
    let filtered = meals;
    if (args.startDate) {
      filtered = filtered.filter((m) => m.date >= args.startDate!);
    }
    if (args.endDate) {
      filtered = filtered.filter((m) => m.date <= args.endDate!);
    }
    
    return filtered.sort((a, b) => a.date - b.date);
  },
});

export const getMealsByDate = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    return await ctx.db
      .query("hostelMeals")
      .withIndex("by_collegeId_date", (q) =>
        q.eq("collegeId", args.collegeId).eq("date", args.date)
      )
      .collect();
  },
});

export const createMeal = mutation({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
    collegeId: v.id("colleges"),
    date: v.number(),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snacks")
    ),
    menu: v.array(v.string()),
    specialItems: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), HOSTEL_ADMIN);
    
    const existing = await ctx.db
      .query("hostelMeals")
      .withIndex("by_hostelId_date", (q) =>
        q.eq("hostelId", args.hostelId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("mealType"), args.mealType))
      .first();
    
    if (existing) {
      throw new Error("Meal already exists for this date and type");
    }
    
    const now = Date.now();
    return await ctx.db.insert("hostelMeals", {
      hostelId: args.hostelId,
      collegeId: args.collegeId,
      date: args.date,
      mealType: args.mealType,
      menu: args.menu,
      specialItems: args.specialItems,
      status: "active",
      createdAt: now,
    });
  },
});

export const updateMeal = mutation({
  args: {
    clerkUserId: v.string(),
    mealId: v.id("hostelMeals"),
    menu: v.optional(v.array(v.string())),
    specialItems: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), HOSTEL_ADMIN);
    
    const updates: any = {};
    if (args.menu !== undefined) updates.menu = args.menu;
    if (args.specialItems !== undefined) updates.specialItems = args.specialItems;
    if (args.status !== undefined) updates.status = args.status;
    
    await ctx.db.patch(args.mealId, updates);
    return args.mealId;
  },
});

export const deleteMeal = mutation({
  args: {
    clerkUserId: v.string(),
    mealId: v.id("hostelMeals"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), HOSTEL_ADMIN);
    await ctx.db.delete(args.mealId);
    return { success: true };
  },
});

export const createReview = mutation({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
    collegeId: v.id("colleges"),
    rating: v.number(),
    cleanlinessRating: v.optional(v.number()),
    foodRating: v.optional(v.number()),
    facilitiesRating: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    const existing = await ctx.db
      .query("hostelReviews")
      .withIndex("by_hostelId_userId", (q) =>
        q.eq("hostelId", args.hostelId).eq("userId", userId)
      )
      .first();
    
    const now = Date.now();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        cleanlinessRating: args.cleanlinessRating,
        foodRating: args.foodRating,
        facilitiesRating: args.facilitiesRating,
        comment: args.comment,
        status: "active",
        createdAt: now,
      });
      return existing._id;
    }
    
    return await ctx.db.insert("hostelReviews", {
      hostelId: args.hostelId,
      userId,
      collegeId: args.collegeId,
      rating: args.rating,
      cleanlinessRating: args.cleanlinessRating,
      foodRating: args.foodRating,
      facilitiesRating: args.facilitiesRating,
      comment: args.comment,
      status: "active",
      createdAt: now,
    });
  },
});

export const getReviewsByHostel = query({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const query = ctx.db
      .query("hostelReviews")
      .withIndex("by_hostelId", (q) => q.eq("hostelId", args.hostelId))
      .order("desc");
    
    const reviews = args.limit
      ? await query.take(args.limit)
      : await query.collect();
    
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userAvatar: user?.avatarUrl,
        };
      })
    );
    
    return reviewsWithUsers;
  },
});

export const getUserReview = query({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    return await ctx.db
      .query("hostelReviews")
      .withIndex("by_hostelId_userId", (q) =>
        q.eq("hostelId", args.hostelId).eq("userId", auth.userId!)
      )
      .first();
  },
});

export const getHostelRatings = query({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const reviews = await ctx.db
      .query("hostelReviews")
      .withIndex("by_hostelId", (q) => q.eq("hostelId", args.hostelId))
      .collect();
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        averageCleanliness: 0,
        averageFood: 0,
        averageFacilities: 0,
      };
    }
    
    const activeReviews = reviews.filter((r) => r.status !== "deleted");
    
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    
    const ratings = activeReviews.map((r) => r.rating);
    const cleanlinessRatings = activeReviews
      .filter((r) => r.cleanlinessRating !== undefined)
      .map((r) => r.cleanlinessRating!);
    const foodRatings = activeReviews
      .filter((r) => r.foodRating !== undefined)
      .map((r) => r.foodRating!);
    const facilitiesRatings = activeReviews
      .filter((r) => r.facilitiesRating !== undefined)
      .map((r) => r.facilitiesRating!);
    
    return {
      averageRating: sum(ratings) / ratings.length,
      totalReviews: activeReviews.length,
      averageCleanliness:
        cleanlinessRatings.length > 0
          ? sum(cleanlinessRatings) / cleanlinessRatings.length
          : 0,
      averageFood:
        foodRatings.length > 0 ? sum(foodRatings) / foodRatings.length : 0,
      averageFacilities:
        facilitiesRatings.length > 0
          ? sum(facilitiesRatings) / facilitiesRatings.length
          : 0,
    };
  },
});

export const deleteReview = mutation({
  args: {
    clerkUserId: v.string(),
    reviewId: v.id("hostelReviews"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }
    
    if (review.userId !== auth.userId && !HOSTEL_ADMIN.includes(auth.role!)) {
      throw new Error("Not authorized to delete this review");
    }
    
    await ctx.db.patch(args.reviewId, { status: "deleted" });
    return { success: true };
  },
});

export const createHostel = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    code: v.string(),
    collegeId: v.id("colleges"),
    type: v.union(v.literal("boys"), v.literal("girls"), v.literal("mixed")),
    capacity: v.number(),
    wardenId: v.optional(v.id("users")),
    facilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), HOSTEL_ADMIN);
    
    const now = Date.now();
    return await ctx.db.insert("hostels", {
      name: args.name,
      code: args.code,
      collegeId: args.collegeId,
      type: args.type,
      capacity: args.capacity,
      wardenId: args.wardenId,
      facilities: args.facilities,
      status: "active",
      createdAt: now,
    });
  },
});

export const updateHostel = mutation({
  args: {
    clerkUserId: v.string(),
    hostelId: v.id("hostels"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    type: v.optional(v.union(v.literal("boys"), v.literal("girls"), v.literal("mixed"))),
    capacity: v.optional(v.number()),
    wardenId: v.optional(v.id("users")),
    facilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), HOSTEL_ADMIN);
    
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.code !== undefined) updates.code = args.code;
    if (args.type !== undefined) updates.type = args.type;
    if (args.capacity !== undefined) updates.capacity = args.capacity;
    if (args.wardenId !== undefined) updates.wardenId = args.wardenId;
    if (args.facilities !== undefined) updates.facilities = args.facilities;
    if (args.status !== undefined) updates.status = args.status;
    
    await ctx.db.patch(args.hostelId, updates);
    return args.hostelId;
  },
});
