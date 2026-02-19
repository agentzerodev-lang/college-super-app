import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ADMIN_ONLY } from "./auth";
import { Id } from "./_generated/dataModel";

export const getWallet = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return wallet ?? null;
  },
});

export const getTransactions = query({
  args: {
    clerkUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!wallet) {
      return [];
    }
    
    const query = ctx.db
      .query("walletTransactions")
      .withIndex("by_walletId", (q) => q.eq("walletId", wallet._id))
      .order("desc");
    
    if (args.limit) {
      return await query.take(args.limit);
    }
    
    return await query.collect();
  },
});

export const creditWallet = mutation({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    category: v.optional(v.union(
      v.literal("topup"),
      v.literal("canteen"),
      v.literal("print"),
      v.literal("library_fine"),
      v.literal("refund"),
      v.literal("reward"),
      v.literal("other")
    )),
    referenceId: v.optional(v.string()),
    referenceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found for user");
    }
    
    if (wallet.status === "frozen") {
      throw new Error("Wallet is frozen");
    }
    
    const now = Date.now();
    const newBalance = wallet.balance + args.amount;
    
    await ctx.db.patch(wallet._id, {
      balance: newBalance,
      updatedAt: now,
    });
    
    const user = await ctx.db.get(args.targetUserId);
    
    if (!user?.collegeId) {
      throw new Error("User must be associated with a college");
    }
    
    await ctx.db.insert("walletTransactions", {
      walletId: wallet._id,
      userId: args.targetUserId,
      collegeId: user.collegeId,
      type: "credit",
      amount: args.amount,
      category: args.category || "other",
      description: args.reason,
      referenceId: args.referenceId,
      referenceType: args.referenceType,
      balanceAfter: newBalance,
      status: "completed",
      createdAt: now,
    });
    
    return { success: true, newBalance };
  },
});

export const debitWallet = mutation({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    category: v.optional(v.union(
      v.literal("topup"),
      v.literal("canteen"),
      v.literal("print"),
      v.literal("library_fine"),
      v.literal("refund"),
      v.literal("reward"),
      v.literal("other")
    )),
    referenceId: v.optional(v.string()),
    referenceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found for user");
    }
    
    if (wallet.status === "frozen") {
      throw new Error("Wallet is frozen");
    }
    
    if (wallet.balance < args.amount) {
      throw new Error("Insufficient balance");
    }
    
    const now = Date.now();
    const newBalance = wallet.balance - args.amount;
    
    await ctx.db.patch(wallet._id, {
      balance: newBalance,
      updatedAt: now,
    });
    
    const user = await ctx.db.get(args.targetUserId);
    
    if (!user?.collegeId) {
      throw new Error("User must be associated with a college");
    }
    
    await ctx.db.insert("walletTransactions", {
      walletId: wallet._id,
      userId: args.targetUserId,
      collegeId: user.collegeId,
      type: "debit",
      amount: args.amount,
      category: args.category || "other",
      description: args.reason,
      referenceId: args.referenceId,
      referenceType: args.referenceType,
      balanceAfter: newBalance,
      status: "completed",
      createdAt: now,
    });
    
    return { success: true, newBalance };
  },
});

export const awardReward = mutation({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    points: v.number(),
    creditAmount: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("points"),
      v.literal("badge"),
      v.literal("certificate"),
      v.literal("discount")
    )),
    source: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const user = await ctx.db.get(args.targetUserId);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (!user.collegeId) {
      throw new Error("User must be associated with a college");
    }
    
    const now = Date.now();
    
    await ctx.db.insert("rewards", {
      userId: args.targetUserId,
      collegeId: user.collegeId,
      type: args.type || "points",
      name: args.name,
      description: args.description,
      points: args.points,
      source: args.source,
      sourceId: args.sourceId,
      imageUrl: args.imageUrl,
      expiresAt: args.expiresAt,
      status: "active",
      createdAt: now,
    });
    
    if (args.creditAmount && args.creditAmount > 0) {
      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
        .first();
      
      if (wallet) {
        const newBalance = wallet.balance + args.creditAmount;
        
        await ctx.db.patch(wallet._id, {
          balance: newBalance,
          updatedAt: now,
        });
        
        await ctx.db.insert("walletTransactions", {
          walletId: wallet._id,
          userId: args.targetUserId,
          collegeId: user.collegeId,
          type: "credit",
          amount: args.creditAmount,
          category: "reward",
          description: `Reward: ${args.name}`,
          referenceId: args.sourceId,
          referenceType: args.source,
          balanceAfter: newBalance,
          status: "completed",
          createdAt: now,
        });
      }
    }
    
    return { success: true };
  },
});

export const getUserRewards = query({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    const userId = args.targetUserId || auth.userId!;
    
    if (args.targetUserId && args.targetUserId !== auth.userId) {
      requireRole(auth, ADMIN_ONLY);
    }
    
    return await ctx.db
      .query("rewards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const freezeWallet = mutation({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found for user");
    }
    
    const now = Date.now();
    
    await ctx.db.patch(wallet._id, {
      status: "frozen",
      updatedAt: now,
    });
    
    return { success: true };
  },
});

export const unfreezeWallet = mutation({
  args: {
    clerkUserId: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found for user");
    }
    
    const now = Date.now();
    
    await ctx.db.patch(wallet._id, {
      status: "active",
      updatedAt: now,
    });
    
    return { success: true };
  },
});

export const getWalletStats = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.optional(v.id("colleges")),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const wallets = await ctx.db.query("wallets").collect();
    
    const stats = {
      totalWallets: 0,
      activeWallets: 0,
      frozenWallets: 0,
      totalBalance: 0,
      totalCredits: 0,
      totalDebits: 0,
    };
    
    for (const wallet of wallets) {
      if (args.collegeId) {
        const user = await ctx.db.get(wallet.userId);
        if (!user || user.collegeId !== args.collegeId) {
          continue;
        }
      }
      
      stats.totalWallets++;
      stats.totalBalance += wallet.balance;
      
      if (wallet.status === "active") {
        stats.activeWallets++;
      } else if (wallet.status === "frozen") {
        stats.frozenWallets++;
      }
    }
    
    const transactions = await ctx.db.query("walletTransactions").collect();
    
    for (const tx of transactions) {
      if (args.collegeId && tx.collegeId !== args.collegeId) {
        continue;
      }
      
      if (tx.type === "credit") {
        stats.totalCredits += tx.amount;
      } else {
        stats.totalDebits += tx.amount;
      }
    }
    
    return stats;
  },
});
