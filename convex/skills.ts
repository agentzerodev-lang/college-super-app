import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, ADMIN_ONLY } from "./auth";

export const submitScore = mutation({
  args: {
    clerkUserId: v.string(),
    skillName: v.string(),
    score: v.number(),
    category: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    isAnonymous: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    const user = auth.user!;

    if (!user.collegeId) {
      throw new Error("User must be associated with a college");
    }

    const now = Date.now();

    const existingEntry = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_userId_skillName", (q) => 
        q.eq("userId", userId).eq("skillName", args.skillName)
      )
      .first();

    if (existingEntry) {
      if (args.score > existingEntry.score) {
        await ctx.db.patch(existingEntry._id, {
          score: args.score,
          category: args.category || existingEntry.category,
          verifiedAt: now,
          status: "active",
        });
      }
      return { success: true, updated: true, isNewBest: args.score > existingEntry.score };
    }

    await ctx.db.insert("skillsLeaderboard", {
      userId,
      collegeId: user.collegeId,
      skillName: args.skillName,
      category: args.category,
      score: args.score,
      isAnonymous: args.isAnonymous || false,
      eventId: args.eventId,
      metadata: args.metadata,
      verifiedAt: now,
      status: "active",
      createdAt: now,
    });

    return { success: true, updated: false, isNewBest: true };
  },
});

export const getLeaderboard = query({
  args: {
    clerkUserId: v.string(),
    skillName: v.optional(v.string()),
    category: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    collegeId: v.optional(v.id("colleges")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    const user = auth.user!;

    const collegeId = args.collegeId || user.collegeId;
    if (!collegeId) {
      throw new Error("College ID required");
    }

    const limit = args.limit || 50;

    let scores;

    if (args.skillName) {
      scores = await ctx.db
        .query("skillsLeaderboard")
        .withIndex("by_collegeId_skillName", (q) => 
          q.eq("collegeId", collegeId).eq("skillName", args.skillName!)
        )
        .order("desc")
        .take(limit * 2);
    } else {
      scores = await ctx.db
        .query("skillsLeaderboard")
        .withIndex("by_collegeId_score", (q) => q.eq("collegeId", collegeId))
        .order("desc")
        .take(limit * 2);
    }

    let filteredScores = scores.filter(s => s.status === "active");

    if (args.category) {
      filteredScores = filteredScores.filter(s => s.category === args.category);
    }

    if (args.eventId) {
      filteredScores = filteredScores.filter(s => s.eventId === args.eventId);
    }

    const leaderboard = [];
    const processedUsers = new Set<string>();
    let rank = 1;

    for (const score of filteredScores) {
      const key = args.skillName ? `${score.userId}` : `${score.userId}_${score.skillName}`;
      
      if (!args.skillName && processedUsers.has(score.userId)) {
        continue;
      }
      processedUsers.add(score.userId);

      const scoreUser = await ctx.db.get(score.userId);
      
      let displayName: string;
      if (score.isAnonymous) {
        displayName = `Player ${score.userId.slice(-6).toUpperCase()}`;
      } else if (scoreUser) {
        displayName = scoreUser.name;
      } else {
        displayName = `Player ${score.userId.slice(-6).toUpperCase()}`;
      }

      leaderboard.push({
        rank,
        userId: score.userId,
        displayName,
        isAnonymous: score.isAnonymous || false,
        skillName: score.skillName,
        category: score.category,
        score: score.score,
        badges: score.badges || [],
        isCurrentUser: score.userId === user._id,
        verifiedAt: score.verifiedAt,
      });

      rank++;
      if (leaderboard.length >= limit) break;
    }

    return leaderboard;
  },
});

export const getEventLeaderboard = query({
  args: {
    clerkUserId: v.string(),
    eventId: v.id("events"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const limit = args.limit || 50;

    const scores = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_collegeId_score", (q) => q.eq("collegeId", event.collegeId))
      .order("desc")
      .take(limit * 2);

    const eventScores = scores.filter(s => 
      s.eventId === args.eventId && s.status === "active"
    );

    const leaderboard = [];
    let rank = 1;

    for (const score of eventScores) {
      const scoreUser = await ctx.db.get(score.userId);
      
      let displayName: string;
      if (score.isAnonymous) {
        displayName = `Player ${score.userId.slice(-6).toUpperCase()}`;
      } else if (scoreUser) {
        displayName = scoreUser.name;
      } else {
        displayName = `Player ${score.userId.slice(-6).toUpperCase()}`;
      }

      leaderboard.push({
        rank,
        userId: score.userId,
        displayName,
        isAnonymous: score.isAnonymous || false,
        skillName: score.skillName,
        category: score.category,
        score: score.score,
        badges: score.badges || [],
        isCurrentUser: score.userId === auth.userId,
        verifiedAt: score.verifiedAt,
      });

      rank++;
      if (leaderboard.length >= limit) break;
    }

    return {
      event: {
        _id: event._id,
        title: event.title,
        type: event.type,
      },
      leaderboard,
    };
  },
});

export const getOverallLeaderboard = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.optional(v.id("colleges")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    const user = auth.user!;

    const collegeId = args.collegeId || user.collegeId;
    if (!collegeId) {
      throw new Error("College ID required");
    }

    const limit = args.limit || 50;

    const scores = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const userAggregates = new Map<string, {
      userId: string;
      totalScore: number;
      skills: { skillName: string; score: number; category?: string }[];
      highestScore: number;
      isAnonymous: boolean;
    }>();

    for (const score of scores) {
      const existing = userAggregates.get(score.userId);
      if (existing) {
        existing.totalScore += score.score;
        existing.skills.push({
          skillName: score.skillName,
          score: score.score,
          category: score.category,
        });
        if (score.score > existing.highestScore) {
          existing.highestScore = score.score;
        }
        if (score.isAnonymous) {
          existing.isAnonymous = true;
        }
      } else {
        userAggregates.set(score.userId, {
          userId: score.userId,
          totalScore: score.score,
          skills: [{
            skillName: score.skillName,
            score: score.score,
            category: score.category,
          }],
          highestScore: score.score,
          isAnonymous: score.isAnonymous || false,
        });
      }
    }

    const sortedAggregates = Array.from(userAggregates.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    const leaderboard = [];
    let rank = 1;

    for (const aggregate of sortedAggregates) {
      const scoreUser = await ctx.db.get(aggregate.userId as any);
      
      let displayName: string;
      if (aggregate.isAnonymous) {
        displayName = `Player ${aggregate.userId.slice(-6).toUpperCase()}`;
      } else if (scoreUser && "name" in scoreUser) {
        displayName = scoreUser.name;
      } else {
        displayName = `Player ${aggregate.userId.slice(-6).toUpperCase()}`;
      }

      leaderboard.push({
        rank,
        userId: aggregate.userId,
        displayName,
        isAnonymous: aggregate.isAnonymous,
        totalScore: aggregate.totalScore,
        skillCount: aggregate.skills.length,
        highestScore: aggregate.highestScore,
        topSkills: aggregate.skills
          .sort((a, b) => b.score - a.score)
          .slice(0, 3),
        isCurrentUser: aggregate.userId === user._id,
      });

      rank++;
    }

    return leaderboard;
  },
});

export const getUserRanking = query({
  args: {
    clerkUserId: v.string(),
    skillName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    const user = auth.user!;

    if (!user.collegeId) {
      throw new Error("User must be associated with a college");
    }

    let scores;
    if (args.skillName) {
      scores = await ctx.db
        .query("skillsLeaderboard")
        .withIndex("by_collegeId_skillName", (q) => 
          q.eq("collegeId", user.collegeId!).eq("skillName", args.skillName!)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    } else {
      scores = await ctx.db
        .query("skillsLeaderboard")
        .withIndex("by_collegeId", (q) => q.eq("collegeId", user.collegeId!))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    }

    if (!args.skillName) {
      const userAggregates = new Map<string, number>();
      for (const score of scores) {
        const existing = userAggregates.get(score.userId) || 0;
        userAggregates.set(score.userId, existing + score.score);
      }

      const sortedUsers = Array.from(userAggregates.entries())
        .sort((a, b) => b[1] - a[1]);

      const userRank = sortedUsers.findIndex(([uid]) => uid === userId) + 1;
      const userTotalScore = userAggregates.get(userId) || 0;

      return {
        rank: userRank > 0 ? userRank : null,
        score: userTotalScore,
        totalParticipants: sortedUsers.length,
        percentile: userRank > 0 
          ? Math.round((1 - (userRank - 1) / sortedUsers.length) * 100) 
          : null,
      };
    }

    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const userScore = sortedScores.find(s => s.userId === userId);
    const userRank = sortedScores.findIndex(s => s.userId === userId) + 1;

    return {
      rank: userRank > 0 ? userRank : null,
      score: userScore?.score || 0,
      totalParticipants: sortedScores.length,
      percentile: userRank > 0 
        ? Math.round((1 - (userRank - 1) / sortedScores.length) * 100) 
        : null,
      badges: userScore?.badges || [],
    };
  },
});

export const getUserSkills = query({
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

    const skills = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return skills.map(skill => ({
      _id: skill._id,
      skillName: skill.skillName,
      category: skill.category,
      score: skill.score,
      rank: skill.rank,
      badges: skill.badges || [],
      isAnonymous: skill.isAnonymous || false,
      verifiedAt: skill.verifiedAt,
      createdAt: skill.createdAt,
    }));
  },
});

export const updateGhostMode = mutation({
  args: {
    clerkUserId: v.string(),
    skillName: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const entry = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_userId_skillName", (q) => 
        q.eq("userId", userId).eq("skillName", args.skillName)
      )
      .first();

    if (!entry) {
      throw new Error("Skill entry not found");
    }

    await ctx.db.patch(entry._id, {
      isAnonymous: args.isAnonymous,
    });

    return { success: true };
  },
});

export const setAllGhostMode = mutation({
  args: {
    clerkUserId: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const entries = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const entry of entries) {
      await ctx.db.patch(entry._id, {
        isAnonymous: args.isAnonymous,
      });
    }

    return { success: true, updatedCount: entries.length };
  },
});

export const getSkillCategories = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.optional(v.id("colleges")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    const user = auth.user!;

    const collegeId = args.collegeId || user.collegeId;
    if (!collegeId) {
      throw new Error("College ID required");
    }

    const scores = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const categories = new Map<string, { count: number; topScore: number }>();
    const skillNames = new Map<string, { count: number; topScore: number; category?: string }>();

    for (const score of scores) {
      if (score.category) {
        const cat = categories.get(score.category) || { count: 0, topScore: 0 };
        cat.count++;
        if (score.score > cat.topScore) cat.topScore = score.score;
        categories.set(score.category, cat);
      }

      const skill = skillNames.get(score.skillName) || { 
        count: 0, 
        topScore: 0, 
        category: score.category 
      };
      skill.count++;
      if (score.score > skill.topScore) skill.topScore = score.score;
      skillNames.set(score.skillName, skill);
    }

    return {
      categories: Array.from(categories.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count),
      skills: Array.from(skillNames.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count),
    };
  },
});

export const getTopPerformers = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.optional(v.id("colleges")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    const user = auth.user!;

    const collegeId = args.collegeId || user.collegeId;
    if (!collegeId) {
      throw new Error("College ID required");
    }

    const limit = args.limit || 10;

    const scores = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_collegeId_score", (q) => q.eq("collegeId", collegeId))
      .order("desc")
      .take(limit * 2);

    const activeScores = scores.filter(s => s.status === "active");

    const performers = [];
    const seenUsers = new Set<string>();

    for (const score of activeScores) {
      if (seenUsers.has(score.userId)) continue;
      seenUsers.add(score.userId);

      const scoreUser = await ctx.db.get(score.userId);
      
      let displayName: string;
      if (score.isAnonymous) {
        displayName = `Player ${score.userId.slice(-6).toUpperCase()}`;
      } else if (scoreUser) {
        displayName = scoreUser.name;
      } else {
        displayName = `Player ${score.userId.slice(-6).toUpperCase()}`;
      }

      performers.push({
        userId: score.userId,
        displayName,
        isAnonymous: score.isAnonymous || false,
        topSkill: score.skillName,
        topScore: score.score,
        badges: score.badges || [],
      });

      if (performers.length >= limit) break;
    }

    return performers;
  },
});

export const deleteSkillEntry = mutation({
  args: {
    clerkUserId: v.string(),
    entryId: v.id("skillsLeaderboard"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Entry not found");
    }

    if (entry.userId !== userId) {
      requireRole(auth, ADMIN_ONLY);
    }

    await ctx.db.patch(args.entryId, { status: "deleted" });

    return { success: true };
  },
});

export const getLeaderboardStats = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.optional(v.id("colleges")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    const user = auth.user!;

    const collegeId = args.collegeId || user.collegeId;
    if (!collegeId) {
      throw new Error("College ID required");
    }

    const scores = await ctx.db
      .query("skillsLeaderboard")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const uniqueUsers = new Set(scores.map(s => s.userId));
    const uniqueSkills = new Set(scores.map(s => s.skillName));
    const uniqueCategories = new Set(scores.filter(s => s.category).map(s => s.category));

    const topScore = scores.reduce((max, s) => Math.max(max, s.score), 0);
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) 
      : 0;

    const anonymousCount = scores.filter(s => s.isAnonymous).length;

    return {
      totalEntries: scores.length,
      totalParticipants: uniqueUsers.size,
      totalSkills: uniqueSkills.size,
      totalCategories: uniqueCategories.size,
      topScore,
      averageScore: avgScore,
      anonymousParticipants: anonymousCount,
    };
  },
});
