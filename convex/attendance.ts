import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, FACULTY_ADMIN, ALL_ROLES } from "./auth";

export const markAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    studentId: v.id("users"),
    courseId: v.id("courses"),
    date: v.number(),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    const now = Date.now();
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", args.studentId).eq("courseId", args.courseId)
      )
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        notes: args.notes,
      });
      return existing._id;
    }

    return await ctx.db.insert("attendance", {
      userId: args.studentId,
      courseId: args.courseId,
      date: args.date,
      status: args.status,
      markedBy: userId,
      notes: args.notes,
      createdAt: now,
    });
  },
});

export const bulkMarkAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    courseId: v.id("courses"),
    date: v.number(),
    records: v.array(v.object({
      studentId: v.id("users"),
      status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    const now = Date.now();
    const results = [];

    for (const record of args.records) {
      const existing = await ctx.db
        .query("attendance")
        .withIndex("by_userId_courseId", (q) =>
          q.eq("userId", record.studentId).eq("courseId", args.courseId)
        )
        .filter((q) => q.eq(q.field("date"), args.date))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: record.status,
          notes: record.notes,
        });
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("attendance", {
          userId: record.studentId,
          courseId: args.courseId,
          date: args.date,
          status: record.status,
          markedBy: userId,
          notes: record.notes,
          createdAt: now,
        });
        results.push(id);
      }
    }

    return results;
  },
});

export const getStudentAttendance = query({
  args: {
    clerkUserId: v.string(),
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    if (auth.role !== "admin" && auth.role !== "faculty" && auth.userId !== args.studentId) {
      throw new Error("Not authorized to view this student's attendance");
    }

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_userId", (q) => q.eq("userId", args.studentId))
      .collect();

    const courseIds = [...new Set(records.filter(r => r.courseId).map((r) => r.courseId!))];
    const subjectIds = [...new Set(records.filter(r => r.studentSubjectId).map((r) => r.studentSubjectId!))];
    
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
    const studentSubjects = await Promise.all(subjectIds.map((id) => ctx.db.get(id)));

    return records.map((r) => ({
      ...r,
      course: courses.find((c) => c?._id === r.courseId) || null,
      studentSubject: studentSubjects.find((s) => s?._id === r.studentSubjectId) || null,
    }));
  },
});

export const getStudentAttendanceByCourse = query({
  args: {
    clerkUserId: v.string(),
    studentId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    if (auth.role !== "admin" && auth.role !== "faculty" && auth.userId !== args.studentId) {
      throw new Error("Not authorized");
    }

    return await ctx.db
      .query("attendance")
      .withIndex("by_userId_courseId", (q) =>
        q.eq("userId", args.studentId).eq("courseId", args.courseId)
      )
      .collect();
  },
});

export const getCourseAttendance = query({
  args: {
    clerkUserId: v.string(),
    courseId: v.id("courses"),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);

    const date = args.date;

    if (date) {
      return await ctx.db
        .query("attendance")
        .withIndex("by_courseId_date", (q) =>
          q.eq("courseId", args.courseId).eq("date", date)
        )
        .collect();
    }

    return await ctx.db
      .query("attendance")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const getAttendanceByDateRange = query({
  args: {
    clerkUserId: v.string(),
    studentId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    if (auth.role !== "admin" && auth.role !== "faculty" && auth.userId !== args.studentId) {
      throw new Error("Not authorized");
    }

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", args.studentId).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    const courseIds = [...new Set(records.filter(r => r.courseId).map((r) => r.courseId!))];
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));

    return records.map((r) => ({
      ...r,
      course: courses.find((c) => c?._id === r.courseId) || null,
    }));
  },
});

export const getAttendanceStats = query({
  args: {
    clerkUserId: v.string(),
    studentId: v.id("users"),
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    if (auth.role !== "admin" && auth.role !== "faculty" && auth.userId !== args.studentId) {
      throw new Error("Not authorized");
    }

    let records;
    const courseId = args.courseId;
    
    if (courseId) {
      records = await ctx.db
        .query("attendance")
        .withIndex("by_userId_courseId", (q) =>
          q.eq("userId", args.studentId).eq("courseId", courseId)
        )
        .collect();
    } else {
      records = await ctx.db
        .query("attendance")
        .withIndex("by_userId", (q) => q.eq("userId", args.studentId))
        .collect();
    }

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;

    return {
      total,
      present,
      absent,
      late,
      attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },
});

export const updateAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    attendanceId: v.id("attendance"),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);

    await ctx.db.patch(args.attendanceId, {
      status: args.status,
      notes: args.notes,
    });

    return args.attendanceId;
  },
});

export const deleteAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    attendanceId: v.id("attendance"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    await ctx.db.delete(args.attendanceId);
    return args.attendanceId;
  },
});

export const getTodayAttendance = query({
  args: {
    clerkUserId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return await ctx.db
      .query("attendance")
      .withIndex("by_courseId_date", (q) =>
        q.eq("courseId", args.courseId).eq("date", todayTimestamp)
      )
      .collect();
  },
});

export const markMyAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    courseId: v.optional(v.id("courses")),
    studentSubjectId: v.optional(v.id("studentSubjects")),
    date: v.number(),
    period: v.number(),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    if (!args.courseId && !args.studentSubjectId) {
      throw new Error("Either courseId or studentSubjectId is required");
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .collect();
    
    const matching = existing.find(r => 
      r.period === args.period && 
      ((args.courseId && r.courseId === args.courseId) || 
       (args.studentSubjectId && r.studentSubjectId === args.studentSubjectId))
    );

    if (matching) {
      await ctx.db.patch(matching._id, {
        status: args.status,
        notes: args.notes,
      });
      return matching._id;
    }

    return await ctx.db.insert("attendance", {
      userId: userId,
      courseId: args.courseId,
      studentSubjectId: args.studentSubjectId,
      date: args.date,
      period: args.period,
      status: args.status,
      markedBy: userId,
      notes: args.notes,
      createdAt: now,
    });
  },
});

export const bulkMarkMyAttendance = mutation({
  args: {
    clerkUserId: v.string(),
    records: v.array(v.object({
      courseId: v.id("courses"),
      date: v.number(),
      period: v.number(),
      status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    const now = Date.now();
    const results = [];

    for (const record of args.records) {
      const existingRecords = await ctx.db
        .query("attendance")
        .withIndex("by_userId_date", (q) =>
          q.eq("userId", userId).eq("date", record.date)
        )
        .collect();
      
      const existing = existingRecords.find(r => r.courseId === record.courseId && r.period === record.period);

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: record.status,
          notes: record.notes,
        });
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert("attendance", {
          userId: userId,
          courseId: record.courseId,
          date: record.date,
          period: record.period,
          status: record.status,
          markedBy: userId,
          notes: record.notes,
          createdAt: now,
        });
        results.push(id);
      }
    }

    return results;
  },
});

export const getMyAttendanceByDate = query({
  args: {
    clerkUserId: v.string(),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .collect();

    return records;
  },
});

export const getStudentAttendanceWithPeriods = query({
  args: {
    clerkUserId: v.string(),
    studentId: v.id("users"),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    if (auth.role !== "admin" && auth.role !== "faculty" && auth.userId !== args.studentId) {
      throw new Error("Not authorized to view this student's attendance");
    }

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", args.studentId).eq("date", args.date)
      )
      .collect();

    const courseIds = [...new Set(records.filter(r => r.courseId).map((r) => r.courseId!))];
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));

    return records.map((r) => ({
      ...r,
      course: courses.find((c) => c?._id === r.courseId) || null,
    }));
  },
});

export const addStudentSubject = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    const now = Date.now();

    const existing = await ctx.db
      .query("studentSubjects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("code"), args.code.toUpperCase()))
      .first();

    if (existing) {
      throw new Error("Subject with this code already exists");
    }

    return await ctx.db.insert("studentSubjects", {
      userId,
      name: args.name,
      code: args.code.toUpperCase(),
      status: "active",
      createdAt: now,
    });
  },
});

export const deleteStudentSubject = mutation({
  args: {
    clerkUserId: v.string(),
    subjectId: v.id("studentSubjects"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    if (subject.userId !== userId) {
      throw new Error("Not authorized to delete this subject");
    }

    await ctx.db.delete(args.subjectId);
    return args.subjectId;
  },
});

export const getMySubjects = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    return await ctx.db
      .query("studentSubjects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});
