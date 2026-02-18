import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("faculty"),
      v.literal("admin"),
      v.literal("hostelAdmin"),
      v.literal("canteenAdmin")
    ),
    branch: v.optional(v.string()),
    year: v.optional(v.number()),
    hostelId: v.optional(v.string()),
    phone: v.optional(v.string()),
    collegeId: v.optional(v.id("colleges")),
    departmentId: v.optional(v.id("departments")),
    avatarUrl: v.optional(v.string()),
    rollNumber: v.optional(v.string()),
    semester: v.optional(v.number()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_branch", ["branch"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_role", ["collegeId", "role"])
    .index("by_departmentId", ["departmentId"]),

  colleges: defineTable({
    name: v.string(),
    subdomain: v.string(),
    code: v.string(),
    settings: v.optional(v.object({
      theme: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
  })
    .index("by_subdomain", ["subdomain"])
    .index("by_code", ["code"]),

  departments: defineTable({
    name: v.string(),
    code: v.string(),
    collegeId: v.id("colleges"),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_code", ["collegeId", "code"]),

  attendance: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    date: v.number(),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
    markedBy: v.id("users"),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_courseId", ["courseId"])
    .index("by_userId_date", ["userId", "date"])
    .index("by_courseId_date", ["courseId", "date"])
    .index("by_userId_courseId", ["userId", "courseId"]),

  courses: defineTable({
    name: v.string(),
    code: v.string(),
    departmentId: v.id("departments"),
    collegeId: v.id("colleges"),
    credits: v.number(),
    semester: v.number(),
    facultyId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_departmentId", ["departmentId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_facultyId", ["facultyId"])
    .index("by_departmentId_semester", ["departmentId", "semester"]),

  classrooms: defineTable({
    name: v.string(),
    building: v.string(),
    floor: v.number(),
    capacity: v.number(),
    collegeId: v.id("colleges"),
    facilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_building", ["building"])
    .index("by_collegeId_building", ["collegeId", "building"]),

  timetable: defineTable({
    courseId: v.id("courses"),
    classroomId: v.id("classrooms"),
    facultyId: v.id("users"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    collegeId: v.id("colleges"),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_classroomId", ["classroomId"])
    .index("by_facultyId", ["facultyId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_classroomId_dayOfWeek", ["classroomId", "dayOfWeek"])
    .index("by_collegeId_dayOfWeek", ["collegeId", "dayOfWeek"]),

  freeClassrooms: defineTable({
    classroomId: v.id("classrooms"),
    collegeId: v.id("colleges"),
    date: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    isBooked: v.boolean(),
    bookedBy: v.optional(v.id("users")),
    bookedFor: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_classroomId", ["classroomId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_date", ["collegeId", "date"])
    .index("by_classroomId_date", ["classroomId", "date"])
    .index("by_bookedBy", ["bookedBy"]),

  resources: defineTable({
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
    uploadedBy: v.id("users"),
    collegeId: v.id("colleges"),
    tags: v.optional(v.array(v.string())),
    downloadCount: v.optional(v.number()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_courseId", ["courseId"])
    .index("by_uploadedBy", ["uploadedBy"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_type", ["collegeId", "type"])
    .searchIndex("search_resources", {
      searchField: "title",
      filterFields: ["collegeId", "type"],
    }),

  tickets: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("technical"),
      v.literal("academic"),
      v.literal("facility"),
      v.literal("hostel"),
      v.literal("other")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    createdBy: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    collegeId: v.id("colleges"),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_status", ["collegeId", "status"])
    .index("by_collegeId_category", ["collegeId", "category"]),

  sosAlerts: defineTable({
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    type: v.union(v.literal("emergency"), v.literal("medical"), v.literal("security"), v.literal("other")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
    })),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("responding"), v.literal("resolved")),
    responders: v.optional(v.array(v.id("users"))),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_status", ["collegeId", "status"])
    .index("by_status", ["status"]),

  hostelMeals: defineTable({
    hostelId: v.id("hostels"),
    collegeId: v.id("colleges"),
    date: v.number(),
    mealType: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner"), v.literal("snacks")),
    menu: v.array(v.string()),
    specialItems: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_hostelId", ["hostelId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_hostelId_date", ["hostelId", "date"])
    .index("by_collegeId_date", ["collegeId", "date"]),

  hostels: defineTable({
    name: v.string(),
    code: v.string(),
    collegeId: v.id("colleges"),
    type: v.union(v.literal("boys"), v.literal("girls"), v.literal("mixed")),
    capacity: v.number(),
    wardenId: v.optional(v.id("users")),
    facilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_type", ["collegeId", "type"])
    .index("by_wardenId", ["wardenId"]),

  hostelReviews: defineTable({
    hostelId: v.id("hostels"),
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    rating: v.number(),
    cleanlinessRating: v.optional(v.number()),
    foodRating: v.optional(v.number()),
    facilitiesRating: v.optional(v.number()),
    comment: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_hostelId", ["hostelId"])
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_hostelId_userId", ["hostelId", "userId"]),

  canteenItems: defineTable({
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
    canteenId: v.id("canteens"),
    collegeId: v.id("colleges"),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
    isVeg: v.optional(v.boolean()),
    preparationTime: v.optional(v.number()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_canteenId", ["canteenId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_canteenId_category", ["canteenId", "category"])
    .index("by_collegeId_category", ["collegeId", "category"]),

  canteens: defineTable({
    name: v.string(),
    location: v.string(),
    collegeId: v.id("colleges"),
    openingTime: v.string(),
    closingTime: v.string(),
    facilities: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"]),

  canteenOrders: defineTable({
    userId: v.id("users"),
    canteenId: v.id("canteens"),
    collegeId: v.id("colleges"),
    items: v.array(v.object({
      itemId: v.id("canteenItems"),
      quantity: v.number(),
      price: v.number(),
    })),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded")),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
    estimatedTime: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_canteenId", ["canteenId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_status", ["collegeId", "status"])
    .index("by_userId_status", ["userId", "status"]),

  playgrounds: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("cricket"),
      v.literal("football"),
      v.literal("basketball"),
      v.literal("tennis"),
      v.literal("badminton"),
      v.literal("volleyball"),
      v.literal("gym"),
      v.literal("swimming"),
      v.literal("other")
    ),
    collegeId: v.id("colleges"),
    location: v.optional(v.string()),
    capacity: v.number(),
    facilities: v.optional(v.array(v.string())),
    rules: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_type", ["collegeId", "type"]),

  playgroundSlots: defineTable({
    playgroundId: v.id("playgrounds"),
    collegeId: v.id("colleges"),
    date: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    bookedBy: v.optional(v.id("users")),
    bookedFor: v.optional(v.string()),
    isBooked: v.boolean(),
    maxParticipants: v.optional(v.number()),
    currentParticipants: v.optional(v.number()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_playgroundId", ["playgroundId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_playgroundId_date", ["playgroundId", "date"])
    .index("by_bookedBy", ["bookedBy"])
    .index("by_collegeId_date", ["collegeId", "date"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    collegeId: v.id("colleges"),
    creatorId: v.id("users"),
    creatorName: v.optional(v.string()),
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
    registrationCount: v.optional(v.number()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_creatorId", ["creatorId"])
    .index("by_collegeId_startTime", ["collegeId", "startTime"])
    .index("by_collegeId_type", ["collegeId", "type"])
    .searchIndex("search_events", {
      searchField: "title",
      filterFields: ["collegeId", "type"],
    }),

  eventRegistrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    status: v.union(v.literal("registered"), v.literal("attended"), v.literal("cancelled")),
    registeredAt: v.number(),
    cancelledAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_eventId_userId", ["eventId", "userId"])
    .index("by_userId_status", ["userId", "status"]),

  books: defineTable({
    title: v.string(),
    author: v.string(),
    isbn: v.optional(v.string()),
    collegeId: v.id("colleges"),
    category: v.optional(v.string()),
    publisher: v.optional(v.string()),
    publishedYear: v.optional(v.number()),
    totalCopies: v.number(),
    availableCopies: v.number(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_category", ["collegeId", "category"])
    .searchIndex("search_books", {
      searchField: "title",
      filterFields: ["collegeId", "category"],
    }),

  bookBorrows: defineTable({
    bookId: v.id("books"),
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    borrowDate: v.number(),
    dueDate: v.number(),
    returnDate: v.optional(v.number()),
    status: v.union(v.literal("borrowed"), v.literal("returned"), v.literal("overdue")),
    fineAmount: v.optional(v.number()),
    finePaid: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_bookId", ["bookId"])
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_collegeId_status", ["collegeId", "status"])
    .index("by_dueDate", ["dueDate"]),

  wallets: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    collegeId: v.optional(v.id("colleges")),
    currency: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"]),

  walletTransactions: defineTable({
    walletId: v.id("wallets"),
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    type: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    category: v.union(
      v.literal("topup"),
      v.literal("canteen"),
      v.literal("print"),
      v.literal("library_fine"),
      v.literal("refund"),
      v.literal("reward"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    referenceType: v.optional(v.string()),
    balanceAfter: v.number(),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_walletId", ["walletId"])
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_userId_type", ["userId", "type"])
    .index("by_collegeId_createdAt", ["collegeId", "createdAt"]),

  skillsLeaderboard: defineTable({
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    skillName: v.string(),
    category: v.optional(v.string()),
    score: v.number(),
    rank: v.optional(v.number()),
    badges: v.optional(v.array(v.string())),
    verifiedAt: v.optional(v.number()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_skillName", ["collegeId", "skillName"])
    .index("by_collegeId_score", ["collegeId", "score"])
    .index("by_userId_skillName", ["userId", "skillName"]),

  rewards: defineTable({
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    type: v.union(
      v.literal("points"),
      v.literal("badge"),
      v.literal("certificate"),
      v.literal("discount")
    ),
    name: v.string(),
    description: v.optional(v.string()),
    points: v.number(),
    source: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    redeemedAt: v.optional(v.number()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_userId_type", ["userId", "type"])
    .index("by_collegeId_type", ["collegeId", "type"])
    .index("by_userId_status", ["userId", "status"]),

  notifications: defineTable({
    userId: v.id("users"),
    collegeId: v.id("colleges"),
    type: v.union(
      v.literal("event"),
      v.literal("attendance"),
      v.literal("grade"),
      v.literal("announcement"),
      v.literal("reminder"),
      v.literal("sos"),
      v.literal("wallet"),
      v.literal("library"),
      v.literal("canteen"),
      v.literal("other")
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    actionUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_collegeId", ["collegeId"])
    .index("by_userId_isRead", ["userId", "isRead"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  announcements: defineTable({
    collegeId: v.id("colleges"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("general"), v.literal("urgent"), v.literal("event"), v.literal("academic")),
    targetRoles: v.optional(v.array(v.string())),
    targetDepartments: v.optional(v.array(v.id("departments"))),
    createdBy: v.id("users"),
    publishAt: v.number(),
    expiresAt: v.optional(v.number()),
    isPinned: v.optional(v.boolean()),
    status: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collegeId", ["collegeId"])
    .index("by_collegeId_type", ["collegeId", "type"])
    .index("by_collegeId_publishAt", ["collegeId", "publishAt"])
    .index("by_createdBy", ["createdBy"]),
});
