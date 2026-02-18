import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, CANTEEN_ADMIN, ALL_ROLES } from "./auth";

export const getCanteens = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db
      .query("canteens")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
  },
});

export const getCanteenById = query({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    return await ctx.db.get(args.canteenId);
  },
});

export const getCanteenItems = query({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
    category: v.optional(v.union(
      v.literal("breakfast"),
      v.literal("main_course"),
      v.literal("snacks"),
      v.literal("beverages"),
      v.literal("desserts")
    )),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    if (args.category) {
      return await ctx.db
        .query("canteenItems")
        .withIndex("by_canteenId_category", (q) =>
          q.eq("canteenId", args.canteenId).eq("category", args.category)
        )
        .collect();
    }
    
    return await ctx.db
      .query("canteenItems")
      .withIndex("by_canteenId", (q) => q.eq("canteenId", args.canteenId))
      .collect();
  },
});

export const getAvailableItems = query({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const items = await ctx.db
      .query("canteenItems")
      .withIndex("by_canteenId", (q) => q.eq("canteenId", args.canteenId))
      .collect();
    
    return items.filter((item) => item.isAvailable && item.status !== "deleted");
  },
});

export const createCanteenItem = mutation({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
    collegeId: v.id("colleges"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.union(
      v.literal("breakfast"),
      v.literal("main_course"),
      v.literal("snacks"),
      v.literal("beverages"),
      v.literal("desserts")
    ),
    imageUrl: v.optional(v.string()),
    isVeg: v.optional(v.boolean()),
    preparationTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const now = Date.now();
    return await ctx.db.insert("canteenItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      canteenId: args.canteenId,
      collegeId: args.collegeId,
      imageUrl: args.imageUrl,
      isAvailable: true,
      isVeg: args.isVeg,
      preparationTime: args.preparationTime,
      status: "active",
      createdAt: now,
    });
  },
});

export const updateCanteenItem = mutation({
  args: {
    clerkUserId: v.string(),
    itemId: v.id("canteenItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal("breakfast"),
      v.literal("main_course"),
      v.literal("snacks"),
      v.literal("beverages"),
      v.literal("desserts")
    )),
    imageUrl: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    isVeg: v.optional(v.boolean()),
    preparationTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.price !== undefined) updates.price = args.price;
    if (args.category !== undefined) updates.category = args.category;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.isAvailable !== undefined) updates.isAvailable = args.isAvailable;
    if (args.isVeg !== undefined) updates.isVeg = args.isVeg;
    if (args.preparationTime !== undefined) updates.preparationTime = args.preparationTime;
    
    await ctx.db.patch(args.itemId, updates);
    return args.itemId;
  },
});

export const toggleItemAvailability = mutation({
  args: {
    clerkUserId: v.string(),
    itemId: v.id("canteenItems"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    
    await ctx.db.patch(args.itemId, { isAvailable: !item.isAvailable });
    return { success: true, isAvailable: !item.isAvailable };
  },
});

export const deleteCanteenItem = mutation({
  args: {
    clerkUserId: v.string(),
    itemId: v.id("canteenItems"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    await ctx.db.patch(args.itemId, { status: "deleted" });
    return { success: true };
  },
});

export const createOrder = mutation({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
    collegeId: v.id("colleges"),
    items: v.array(v.object({
      itemId: v.id("canteenItems"),
      quantity: v.number(),
    })),
    notes: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const itemsWithDetails = await Promise.all(
      args.items.map(async (item) => {
        const itemData = await ctx.db.get(item.itemId);
        if (!itemData || !itemData.isAvailable) {
          throw new Error(`Item ${item.itemId} not available`);
        }
        return {
          itemId: item.itemId,
          quantity: item.quantity,
          price: itemData.price,
          preparationTime: itemData.preparationTime || 15,
        };
      })
    );
    
    const itemsWithPrices = itemsWithDetails.map(({ preparationTime, ...rest }) => rest);
    
    const totalAmount = itemsWithPrices.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const estimatedTime = Math.max(
      ...itemsWithDetails.map((item) => item.preparationTime)
    );
    
    const now = Date.now();
    
    const orderId = await ctx.db.insert("canteenOrders", {
      userId,
      canteenId: args.canteenId,
      collegeId: args.collegeId,
      items: itemsWithPrices,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: args.paymentMethod,
      notes: args.notes,
      estimatedTime: 15,
      createdAt: now,
    });
    
    await ctx.db.insert("notifications", {
      userId,
      collegeId: args.collegeId,
      type: "canteen",
      title: "Order Placed",
      message: `Your order #${orderId.slice(-6)} has been placed successfully.`,
      isRead: false,
      data: { orderId, status: "pending" },
      status: "active",
      createdAt: now,
    });
    
    return orderId;
  },
});

export const getUserOrders = query({
  args: {
    clerkUserId: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivered"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    const query = ctx.db
      .query("canteenOrders")
      .withIndex("by_userId", (q) => q.eq("userId", auth.userId!))
      .order("desc");
    
    let orders = args.limit ? await query.take(args.limit) : await query.collect();
    
    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }
    
    return orders;
  },
});

export const getOrderById = query({
  args: {
    clerkUserId: v.string(),
    orderId: v.id("canteenOrders"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return null;
    }
    
    if (order.userId !== auth.userId && !CANTEEN_ADMIN.includes(auth.role!)) {
      throw new Error("Not authorized to view this order");
    }
    
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const itemData = await ctx.db.get(item.itemId);
        return {
          ...item,
          name: itemData?.name || "Unknown Item",
          imageUrl: itemData?.imageUrl,
        };
      })
    );
    
    return {
      ...order,
      items: itemsWithDetails,
    };
  },
});

export const updateOrderStatus = mutation({
  args: {
    clerkUserId: v.string(),
    orderId: v.id("canteenOrders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    estimatedTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    const updates: any = {
      status: args.status,
    };
    
    if (args.estimatedTime !== undefined) {
      updates.estimatedTime = args.estimatedTime;
    }
    
    if (args.status === "delivered") {
      updates.completedAt = Date.now();
      updates.paymentStatus = "paid";
    }
    
    await ctx.db.patch(args.orderId, updates);
    
    const statusMessages: Record<string, string> = {
      confirmed: "has been confirmed",
      preparing: "is being prepared",
      ready: "is ready for pickup",
      delivered: "has been delivered",
      cancelled: "has been cancelled",
    };
    
    await ctx.db.insert("notifications", {
      userId: order.userId,
      collegeId: order.collegeId,
      type: "canteen",
      title: "Order Update",
      message: `Your order #${args.orderId.slice(-6)} ${statusMessages[args.status] || "status updated"}.`,
      isRead: false,
      data: { orderId: args.orderId, status: args.status },
      status: "active",
      createdAt: Date.now(),
    });
    
    return { success: true };
  },
});

export const cancelOrder = mutation({
  args: {
    clerkUserId: v.string(),
    orderId: v.id("canteenOrders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    if (order.userId !== auth.userId && !CANTEEN_ADMIN.includes(auth.role!)) {
      throw new Error("Not authorized to cancel this order");
    }
    
    if (order.status === "delivered" || order.status === "cancelled") {
      throw new Error("Cannot cancel this order");
    }
    
    const now = Date.now();
    
    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      completedAt: now,
    });
    
    await ctx.db.insert("notifications", {
      userId: order.userId,
      collegeId: order.collegeId,
      type: "canteen",
      title: "Order Cancelled",
      message: `Your order #${args.orderId.slice(-6)} has been cancelled.`,
      isRead: false,
      data: { orderId: args.orderId, status: "cancelled", reason: args.reason },
      status: "active",
      createdAt: now,
    });
    
    return { success: true };
  },
});

export const getCanteenOrders = query({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivered"),
      v.literal("cancelled")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const query = ctx.db
      .query("canteenOrders")
      .withIndex("by_canteenId", (q) => q.eq("canteenId", args.canteenId))
      .order("desc");
    
    let orders = args.limit ? await query.take(args.limit) : await query.collect();
    
    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }
    
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          userName: user?.name || "Unknown",
          userEmail: user?.email,
        };
      })
    );
    
    return ordersWithUsers;
  },
});

export const getOrdersByStatus = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const query = ctx.db
      .query("canteenOrders")
      .withIndex("by_collegeId_status", (q) =>
        q.eq("collegeId", args.collegeId).eq("status", args.status)
      )
      .order("desc");
    
    return args.limit ? await query.take(args.limit) : await query.collect();
  },
});

export const createCanteen = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    location: v.string(),
    collegeId: v.id("colleges"),
    openingTime: v.string(),
    closingTime: v.string(),
    facilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const now = Date.now();
    return await ctx.db.insert("canteens", {
      name: args.name,
      location: args.location,
      collegeId: args.collegeId,
      openingTime: args.openingTime,
      closingTime: args.closingTime,
      facilities: args.facilities,
      status: "active",
      createdAt: now,
    });
  },
});

export const updateCanteen = mutation({
  args: {
    clerkUserId: v.string(),
    canteenId: v.id("canteens"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    openingTime: v.optional(v.string()),
    closingTime: v.optional(v.string()),
    facilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.location !== undefined) updates.location = args.location;
    if (args.openingTime !== undefined) updates.openingTime = args.openingTime;
    if (args.closingTime !== undefined) updates.closingTime = args.closingTime;
    if (args.facilities !== undefined) updates.facilities = args.facilities;
    if (args.status !== undefined) updates.status = args.status;
    
    await ctx.db.patch(args.canteenId, updates);
    return args.canteenId;
  },
});

export const getOrderStats = query({
  args: {
    clerkUserId: v.string(),
    canteenId: v.optional(v.id("canteens")),
    collegeId: v.optional(v.id("colleges")),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);
    
    let orders = await ctx.db.query("canteenOrders").collect();
    
    if (args.canteenId) {
      orders = orders.filter((o) => o.canteenId === args.canteenId);
    }
    if (args.collegeId) {
      orders = orders.filter((o) => o.collegeId === args.collegeId);
    }
    
    const now = Date.now();
    const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0)).getTime();
    
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + o.totalAmount, 0),
      todayOrders: orders.filter((o) => o.createdAt >= todayStart).length,
      todayRevenue: orders
        .filter((o) => o.status === "delivered" && o.createdAt >= todayStart)
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
    
    return stats;
  },
});
