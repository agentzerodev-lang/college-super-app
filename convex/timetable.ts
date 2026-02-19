import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, FACULTY_ADMIN, ALL_ROLES } from "./auth";

export const createTimetableEntry = mutation({
  args: {
    clerkUserId: v.string(),
    courseId: v.id("courses"),
    classroomId: v.id("classrooms"),
    facultyId: v.id("users"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    const now = Date.now();

    return await ctx.db.insert("timetable", {
      courseId: args.courseId,
      classroomId: args.classroomId,
      facultyId: args.facultyId,
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      collegeId: args.collegeId,
      status: "active",
      createdAt: now,
    });
  },
});

export const getTimetableByCourse = query({
  args: {
    clerkUserId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    const entries = await ctx.db
      .query("timetable")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const classroomIds = [...new Set(entries.map((e) => e.classroomId))];
    const classrooms = await Promise.all(classroomIds.map((id) => ctx.db.get(id)));

    return entries.map((e) => ({
      ...e,
      classroom: classrooms.find((c) => c?._id === e.classroomId) || null,
    }));
  },
});

export const getTimetableByFaculty = query({
  args: {
    clerkUserId: v.string(),
    facultyId: v.id("users"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    const entries = await ctx.db
      .query("timetable")
      .withIndex("by_facultyId", (q) => q.eq("facultyId", args.facultyId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const courseIds = [...new Set(entries.map((e) => e.courseId))];
    const classroomIds = [...new Set(entries.map((e) => e.classroomId))];
    
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
    const classrooms = await Promise.all(classroomIds.map((id) => ctx.db.get(id)));

    return entries.map((e) => ({
      ...e,
      course: courses.find((c) => c?._id === e.courseId) || null,
      classroom: classrooms.find((c) => c?._id === e.classroomId) || null,
    }));
  },
});

export const getTimetableByClassroom = query({
  args: {
    clerkUserId: v.string(),
    classroomId: v.id("classrooms"),
    dayOfWeek: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    let entries;
    const dayOfWeek = args.dayOfWeek;
    
    if (dayOfWeek !== undefined) {
      entries = await ctx.db
        .query("timetable")
        .withIndex("by_classroomId_dayOfWeek", (q) =>
          q.eq("classroomId", args.classroomId).eq("dayOfWeek", dayOfWeek)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    } else {
      entries = await ctx.db
        .query("timetable")
        .withIndex("by_classroomId", (q) => q.eq("classroomId", args.classroomId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    }

    const courseIds = [...new Set(entries.map((e) => e.courseId))];
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));

    return entries.map((e) => ({
      ...e,
      course: courses.find((c) => c?._id === e.courseId) || null,
    }));
  },
});

export const getNextClass = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let entries;
    if (auth.role === "faculty") {
      entries = await ctx.db
        .query("timetable")
        .withIndex("by_facultyId", (q) => q.eq("facultyId", auth.userId!))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    } else if (auth.role === "student") {
      const user = auth.user;
      if (!user?.departmentId || !user?.semester) {
        return null;
      }

      const courses = await ctx.db
        .query("courses")
        .withIndex("by_departmentId_semester", (q) =>
          q.eq("departmentId", user.departmentId!).eq("semester", user.semester!)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      const courseIds = courses.map((c) => c._id);
      entries = [];
      for (const courseId of courseIds) {
        const courseEntries = await ctx.db
          .query("timetable")
          .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        entries.push(...courseEntries);
      }
    } else {
      return null;
    }

    const todayEntries = entries
      .filter((e) => e.dayOfWeek === currentDay && e.startTime > currentTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todayEntries.length > 0) {
      const entry = todayEntries[0];
      const [course, classroom] = await Promise.all([
        ctx.db.get(entry.courseId),
        ctx.db.get(entry.classroomId),
      ]);
      return {
        ...entry,
        course,
        classroom,
        isToday: true,
      };
    }

    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const nextDayEntries = entries
        .filter((e) => e.dayOfWeek === nextDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (nextDayEntries.length > 0) {
        const entry = nextDayEntries[0];
        const [course, classroom] = await Promise.all([
          ctx.db.get(entry.courseId),
          ctx.db.get(entry.classroomId),
        ]);
        const daysUntil = i;
        return {
          ...entry,
          course,
          classroom,
          isToday: false,
          daysUntil,
        };
      }
    }

    return null;
  },
});

export const updateTimetableEntry = mutation({
  args: {
    clerkUserId: v.string(),
    timetableId: v.id("timetable"),
    classroomId: v.optional(v.id("classrooms")),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);

    const updates: Record<string, unknown> = {};
    if (args.classroomId) updates.classroomId = args.classroomId;
    if (args.startTime) updates.startTime = args.startTime;
    if (args.endTime) updates.endTime = args.endTime;
    if (args.status) updates.status = args.status;

    await ctx.db.patch(args.timetableId, updates);
    return args.timetableId;
  },
});

export const deleteTimetableEntry = mutation({
  args: {
    clerkUserId: v.string(),
    timetableId: v.id("timetable"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    await ctx.db.delete(args.timetableId);
    return args.timetableId;
  },
});

export const getWeeklyTimetable = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    let entries;
    if (auth.role === "faculty") {
      entries = await ctx.db
        .query("timetable")
        .withIndex("by_facultyId", (q) => q.eq("facultyId", auth.userId!))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    } else if (auth.role === "student") {
      const user = auth.user;
      if (!user?.departmentId || !user?.semester) {
        return [];
      }

      const courses = await ctx.db
        .query("courses")
        .withIndex("by_departmentId_semester", (q) =>
          q.eq("departmentId", user.departmentId!).eq("semester", user.semester!)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      const courseIds = courses.map((c) => c._id);
      entries = [];
      for (const courseId of courseIds) {
        const courseEntries = await ctx.db
          .query("timetable")
          .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        entries.push(...courseEntries);
      }
    } else {
      entries = await ctx.db
        .query("timetable")
        .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
    }

    const courseIds = [...new Set(entries.map((e) => e.courseId))];
    const classroomIds = [...new Set(entries.map((e) => e.classroomId))];
    const facultyIds = [...new Set(entries.map((e) => e.facultyId))];

    const [courses, classrooms, faculties] = await Promise.all([
      Promise.all(courseIds.map((id) => ctx.db.get(id))),
      Promise.all(classroomIds.map((id) => ctx.db.get(id))),
      Promise.all(facultyIds.map((id) => ctx.db.get(id))),
    ]);

    return entries.map((e) => ({
      ...e,
      course: courses.find((c) => c?._id === e.courseId) || null,
      classroom: classrooms.find((c) => c?._id === e.classroomId) || null,
      faculty: faculties.find((f) => f?._id === e.facultyId) || null,
    }));
  },
});

export const getFreeClassrooms = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    const allClassrooms = await ctx.db
      .query("classrooms")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const busyEntries = await ctx.db
      .query("timetable")
      .withIndex("by_collegeId_dayOfWeek", (q) =>
        q.eq("collegeId", args.collegeId).eq("dayOfWeek", args.dayOfWeek)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const busyClassroomIds = new Set(
      busyEntries
        .filter((e) => {
          return !(e.endTime <= args.startTime || e.startTime >= args.endTime);
        })
        .map((e) => e.classroomId)
    );

    return allClassrooms.filter((c) => !busyClassroomIds.has(c._id));
  },
});

export const bookFreeClassroom = mutation({
  args: {
    clerkUserId: v.string(),
    classroomId: v.id("classrooms"),
    collegeId: v.id("colleges"),
    date: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    bookedFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await getAuth(ctx, args.clerkUserId));
    const now = Date.now();

    const existingBookings = await ctx.db
      .query("freeClassrooms")
      .withIndex("by_classroomId_date", (q) =>
        q.eq("classroomId", args.classroomId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("isBooked"), true))
      .collect();

    const hasConflict = existingBookings.some((b) => {
      return !(b.endTime <= args.startTime || b.startTime >= args.endTime);
    });

    if (hasConflict) {
      throw new Error("Classroom is already booked for this time slot");
    }

    return await ctx.db.insert("freeClassrooms", {
      classroomId: args.classroomId,
      collegeId: args.collegeId,
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      isBooked: true,
      bookedBy: userId,
      bookedFor: args.bookedFor,
      status: "confirmed",
      createdAt: now,
    });
  },
});

export const cancelBooking = mutation({
  args: {
    clerkUserId: v.string(),
    bookingId: v.id("freeClassrooms"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (auth.role !== "admin" && auth.role !== "faculty" && booking.bookedBy !== auth.userId) {
      throw new Error("Not authorized to cancel this booking");
    }

    await ctx.db.patch(args.bookingId, {
      isBooked: false,
      bookedBy: undefined,
      bookedFor: undefined,
      status: "cancelled",
    });

    return args.bookingId;
  },
});

export const getUserBookings = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);

    const bookings = await ctx.db
      .query("freeClassrooms")
      .withIndex("by_bookedBy", (q) => q.eq("bookedBy", auth.userId!))
      .filter((q) => q.eq(q.field("isBooked"), true))
      .collect();

    const classroomIds = [...new Set(bookings.map((b) => b.classroomId))];
    const classrooms = await Promise.all(classroomIds.map((id) => ctx.db.get(id)));

    return bookings.map((b) => ({
      ...b,
      classroom: classrooms.find((c) => c?._id === b.classroomId) || null,
    }));
  },
});

export const getClassroomBookings = query({
  args: {
    clerkUserId: v.string(),
    classroomId: v.id("classrooms"),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    return await ctx.db
      .query("freeClassrooms")
      .withIndex("by_classroomId_date", (q) =>
        q.eq("classroomId", args.classroomId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("isBooked"), true))
      .collect();
  },
});

export const createClassroom = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    building: v.string(),
    floor: v.number(),
    capacity: v.number(),
    collegeId: v.id("colleges"),
    facilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), FACULTY_ADMIN);
    const now = Date.now();

    return await ctx.db.insert("classrooms", {
      name: args.name,
      building: args.building,
      floor: args.floor,
      capacity: args.capacity,
      collegeId: args.collegeId,
      facilities: args.facilities,
      status: "active",
      createdAt: now,
    });
  },
});

export const getAllClassrooms = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));

    return await ctx.db
      .query("classrooms")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});
