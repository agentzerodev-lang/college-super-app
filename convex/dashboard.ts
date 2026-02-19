import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ADMIN_ONLY, HOSTEL_ADMIN, CANTEEN_ADMIN } from "./auth";

export const getStudentDashboard = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayTimestamp = today.getTime();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    const [todaySchedule, attendanceRecords, tickets, upcomingEvents, wallet, orders, borrows] = await Promise.all([
      (async () => {
        const user = auth.user;
        if (!user?.departmentId || !user?.semester) return [];

        const courses = await ctx.db
          .query("courses")
          .withIndex("by_departmentId_semester", (q) =>
            q.eq("departmentId", user.departmentId!).eq("semester", user.semester!)
          )
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        const courseIds = courses.map((c) => c._id);
        const entries = [];

        for (const courseId of courseIds) {
          const courseEntries = await ctx.db
            .query("timetable")
            .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();
          entries.push(...courseEntries);
        }

        const todayEntries = entries
          .filter((e) => e.dayOfWeek === currentDay)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const courseIds2 = [...new Set(todayEntries.map((e) => e.courseId))];
        const classroomIds = [...new Set(todayEntries.map((e) => e.classroomId))];

        const [coursesData, classroomsData] = await Promise.all([
          Promise.all(courseIds2.map((id) => ctx.db.get(id))),
          Promise.all(classroomIds.map((id) => ctx.db.get(id))),
        ]);

        return todayEntries.map((e) => ({
          ...e,
          course: coursesData.find((c) => c?._id === e.courseId) || null,
          classroom: classroomsData.find((c) => c?._id === e.classroomId) || null,
          isCompleted: e.endTime < currentTime,
          isOngoing: e.startTime <= currentTime && e.endTime > currentTime,
        }));
      })(),
      (async () => {
        return await ctx.db
          .query("attendance")
          .withIndex("by_userId_date", (q) =>
            q.eq("userId", userId).eq("date", todayTimestamp)
          )
          .collect();
      })(),
      (async () => {
        return await ctx.db
          .query("tickets")
          .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
          .filter((q) =>
            q.neq(q.field("status"), "closed") &&
            q.neq(q.field("status"), "resolved")
          )
          .order("desc")
          .take(5);
      })(),
      (async () => {
        const nowTs = Date.now();
        return await ctx.db
          .query("events")
          .withIndex("by_collegeId_startTime", (q) =>
            q.eq("collegeId", args.collegeId).gt("startTime", nowTs)
          )
          .filter((q) => q.eq(q.field("status"), "active"))
          .take(5);
      })(),
      (async () => {
        return await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
      })(),
      (async () => {
        return await ctx.db
          .query("canteenOrders")
          .withIndex("by_userId_status", (q) =>
            q.eq("userId", userId).eq("status", "pending")
          )
          .order("desc")
          .take(5);
      })(),
      (async () => {
        return await ctx.db
          .query("bookBorrows")
          .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "borrowed"))
          .order("desc")
          .take(5);
      })(),
    ]);

    const borrowedBooksWithDetails = await Promise.all(
      borrows.map(async (borrow) => {
        const book = await ctx.db.get(borrow.bookId);
        return { ...borrow, book };
      })
    );

    const attendanceStats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter((r) => r.status === "present").length,
      absent: attendanceRecords.filter((r) => r.status === "absent").length,
      late: attendanceRecords.filter((r) => r.status === "late").length,
    };

    return {
      todaySchedule,
      todayAttendance: attendanceRecords,
      attendanceStats,
      pendingTickets: tickets,
      upcomingEvents,
      walletBalance: wallet?.balance ?? 0,
      walletStatus: wallet?.status ?? "active",
      activeOrders: orders,
      borrowedBooks: borrowedBooksWithDetails,
    };
  },
});

export const getFacultyDashboard = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const [todayClasses, attendanceRecords, assignedTickets] = await Promise.all([
      (async () => {
        const entries = await ctx.db
          .query("timetable")
          .withIndex("by_facultyId", (q) => q.eq("facultyId", userId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        const todayEntries = entries
          .filter((e) => e.dayOfWeek === currentDay)
          .sort((a, b) => a.startTime.localeCompare(b.endTime));

        const courseIds = [...new Set(todayEntries.map((e) => e.courseId))];
        const classroomIds = [...new Set(todayEntries.map((e) => e.classroomId))];

        const [courses, classrooms] = await Promise.all([
          Promise.all(courseIds.map((id) => ctx.db.get(id))),
          Promise.all(classroomIds.map((id) => ctx.db.get(id))),
        ]);

        return todayEntries.map((e) => ({
          ...e,
          course: courses.find((c) => c?._id === e.courseId) || null,
          classroom: classrooms.find((c) => c?._id === e.classroomId) || null,
          isCompleted: e.endTime < currentTime,
          isOngoing: e.startTime <= currentTime && e.endTime > currentTime,
        }));
      })(),
      (async () => {
        const courses = await ctx.db
          .query("courses")
          .withIndex("by_facultyId", (q) => q.eq("facultyId", userId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        const courseIds = courses.map((c) => c._id);
        const todayRecords = [];

        for (const courseId of courseIds) {
          const records = await ctx.db
            .query("attendance")
            .withIndex("by_courseId_date", (q) =>
              q.eq("courseId", courseId).eq("date", todayTimestamp)
            )
            .collect();
          todayRecords.push(...records);
        }

        const todayStats = {
          total: todayRecords.length,
          present: todayRecords.filter((r) => r.status === "present").length,
          absent: todayRecords.filter((r) => r.status === "absent").length,
          late: todayRecords.filter((r) => r.status === "late").length,
        };

        const allRecords = [];
        for (const courseId of courseIds) {
          const records = await ctx.db
            .query("attendance")
            .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
            .collect();
          allRecords.push(...records);
        }

        const overallStats = {
          total: allRecords.length,
          present: allRecords.filter((r) => r.status === "present").length,
          absent: allRecords.filter((r) => r.status === "absent").length,
          late: allRecords.filter((r) => r.status === "late").length,
        };

        return { today: todayStats, overall: overallStats };
      })(),
      (async () => {
        return await ctx.db
          .query("tickets")
          .withIndex("by_assignedTo", (q) => q.eq("assignedTo", userId))
          .filter((q) =>
            q.neq(q.field("status"), "closed") &&
            q.neq(q.field("status"), "resolved")
          )
          .order("desc")
          .take(10);
      })(),
    ]);

    return {
      todayClasses,
      attendanceStats: attendanceRecords,
      assignedTickets,
    };
  },
});

export const getAdminDashboard = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);

    const now = Date.now();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

    const [users, tickets, events, sosAlerts] = await Promise.all([
      (async () => {
        const allUsers = await ctx.db
          .query("users")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .collect();

        return {
          total: allUsers.length,
          active: allUsers.filter((u) => u.status === "active").length,
          students: allUsers.filter((u) => u.role === "student" && u.status === "active").length,
          faculty: allUsers.filter((u) => u.role === "faculty" && u.status === "active").length,
          admins: allUsers.filter((u) => u.role === "admin" && u.status === "active").length,
          hostelAdmins: allUsers.filter((u) => u.role === "hostelAdmin" && u.status === "active").length,
          canteenAdmins: allUsers.filter((u) => u.role === "canteenAdmin" && u.status === "active").length,
        };
      })(),
      (async () => {
        const allTickets = await ctx.db
          .query("tickets")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .collect();

        return {
          total: allTickets.length,
          open: allTickets.filter((t) => t.status === "open").length,
          inProgress: allTickets.filter((t) => t.status === "in_progress").length,
          resolved: allTickets.filter((t) => t.status === "resolved").length,
          closed: allTickets.filter((t) => t.status === "closed").length,
          byPriority: {
            low: allTickets.filter((t) => t.priority === "low").length,
            medium: allTickets.filter((t) => t.priority === "medium").length,
            high: allTickets.filter((t) => t.priority === "high").length,
            urgent: allTickets.filter((t) => t.priority === "urgent").length,
          },
          todayCreated: allTickets.filter((t) => t.createdAt >= todayStart).length,
        };
      })(),
      (async () => {
        const allEvents = await ctx.db
          .query("events")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .collect();

        return {
          total: allEvents.length,
          active: allEvents.filter((e) => e.status === "active").length,
          upcoming: allEvents.filter((e) => e.startTime > now && e.status === "active").length,
          ongoing: allEvents.filter(
            (e) => e.startTime <= now && e.endTime > now && e.status === "active"
          ).length,
          completed: allEvents.filter((e) => e.endTime <= now).length,
        };
      })(),
      (async () => {
        const allAlerts = await ctx.db
          .query("sosAlerts")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .collect();

        const activeAlerts = allAlerts.filter((a) => a.status === "active" || a.status === "responding");

        const alertsWithUsers = await Promise.all(
          activeAlerts.map(async (alert) => {
            const user = await ctx.db.get(alert.userId);
            return {
              ...alert,
              userName: user?.name || "Unknown",
              userEmail: user?.email,
            };
          })
        );

        return {
          total: allAlerts.length,
          active: allAlerts.filter((a) => a.status === "active").length,
          responding: allAlerts.filter((a) => a.status === "responding").length,
          resolved: allAlerts.filter((a) => a.status === "resolved").length,
          activeAlerts: alertsWithUsers,
        };
      })(),
    ]);

    return {
      users,
      tickets,
      events,
      sosAlerts,
    };
  },
});

export const getHostelAdminDashboard = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), HOSTEL_ADMIN);

    const now = new Date();
    const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const [hostels, todayMeals, reviews, hostelTickets] = await Promise.all([
      (async () => {
        return await ctx.db
          .query("hostels")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
      })(),
      (async () => {
        const meals = await ctx.db
          .query("hostelMeals")
          .withIndex("by_collegeId_date", (q) =>
            q.eq("collegeId", args.collegeId).eq("date", todayTimestamp)
          )
          .collect();

        const hostelIds = [...new Set(meals.map((m) => m.hostelId))];
        const hostelsData = await Promise.all(hostelIds.map((id) => ctx.db.get(id)));

        return meals.map((m) => ({
          ...m,
          hostel: hostelsData.find((h) => h?._id === m.hostelId) || null,
        }));
      })(),
      (async () => {
        const allReviews = await ctx.db
          .query("hostelReviews")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .filter((q) => q.neq(q.field("status"), "deleted"))
          .order("desc")
          .take(10);

        const reviewsWithDetails = await Promise.all(
          allReviews.map(async (review) => {
            const [user, hostel] = await Promise.all([
              ctx.db.get(review.userId),
              ctx.db.get(review.hostelId),
            ]);
            return {
              ...review,
              userName: user && "name" in user ? user.name : "Anonymous",
              hostelName: hostel && "name" in hostel ? hostel.name : "Unknown",
            };
          })
        );

        const avgRating = allReviews.length > 0
          ? allReviews.reduce((sum: number, r) => sum + r.rating, 0) / allReviews.length
          : 0;

        return {
          recentReviews: reviewsWithDetails,
          totalReviews: allReviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
        };
      })(),
      (async () => {
        const allTickets = await ctx.db
          .query("tickets")
          .withIndex("by_collegeId_category", (q) =>
            q.eq("collegeId", args.collegeId).eq("category", "hostel")
          )
          .collect();

        return {
          total: allTickets.length,
          open: allTickets.filter((t) => t.status === "open").length,
          inProgress: allTickets.filter((t) => t.status === "in_progress").length,
          resolved: allTickets.filter((t) => t.status === "resolved").length,
          recent: allTickets
            .filter((t) => t.status !== "closed")
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5),
        };
      })(),
    ]);

    return {
      hostels,
      todayMeals,
      reviews,
      hostelTickets,
    };
  },
});

export const getCanteenAdminDashboard = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    await requireRole(await getAuth(ctx, args.clerkUserId), CANTEEN_ADMIN);

    const now = Date.now();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

    const [canteens, orders, items] = await Promise.all([
      (async () => {
        return await ctx.db
          .query("canteens")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
      })(),
      (async () => {
        const allOrders = await ctx.db
          .query("canteenOrders")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .collect();

        const todayOrders = allOrders.filter((o) => o.createdAt >= todayStart);

        const recentActiveOrders = allOrders
          .filter((o) => ["pending", "confirmed", "preparing", "ready"].includes(o.status))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10);

        const ordersWithUsers = await Promise.all(
          recentActiveOrders.map(async (order) => {
            const user = await ctx.db.get(order.userId);
            return {
              ...order,
              userName: user?.name || "Unknown",
            };
          })
        );

        return {
          total: allOrders.length,
          today: todayOrders.length,
          pending: allOrders.filter((o) => o.status === "pending").length,
          confirmed: allOrders.filter((o) => o.status === "confirmed").length,
          preparing: allOrders.filter((o) => o.status === "preparing").length,
          ready: allOrders.filter((o) => o.status === "ready").length,
          delivered: allOrders.filter((o) => o.status === "delivered").length,
          cancelled: allOrders.filter((o) => o.status === "cancelled").length,
          totalRevenue: allOrders
            .filter((o) => o.status === "delivered")
            .reduce((sum, o) => sum + o.totalAmount, 0),
          todayRevenue: todayOrders
            .filter((o) => o.status === "delivered")
            .reduce((sum, o) => sum + o.totalAmount, 0),
          recentActiveOrders: ordersWithUsers,
        };
      })(),
      (async () => {
        const allItems = await ctx.db
          .query("canteenItems")
          .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
          .collect();

        const activeItems = allItems.filter((i) => i.status !== "deleted");

        return {
          total: activeItems.length,
          available: activeItems.filter((i) => i.isAvailable).length,
          unavailable: activeItems.filter((i) => !i.isAvailable).length,
          byCategory: {
            breakfast: activeItems.filter((i) => i.category === "breakfast").length,
            main_course: activeItems.filter((i) => i.category === "main_course").length,
            snacks: activeItems.filter((i) => i.category === "snacks").length,
            beverages: activeItems.filter((i) => i.category === "beverages").length,
            desserts: activeItems.filter((i) => i.category === "desserts").length,
          },
          veg: activeItems.filter((i) => i.isVeg).length,
          nonVeg: activeItems.filter((i) => !i.isVeg).length,
        };
      })(),
    ]);

    return {
      canteens,
      orders,
      items,
    };
  },
});
