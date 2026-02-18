import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuth, requireAuth, requireRole, ALL_ROLES, ADMIN_ONLY } from "./auth";

const DUE_DAYS = 14;
const FINE_PER_DAY = 5;

export const getBooks = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    availableOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    let query;
    
    if (args.search) {
      query = ctx.db
        .query("books")
        .withSearchIndex("search_books", (q) => {
          let searchQuery = q.search("title", args.search!).eq("collegeId", args.collegeId);
          if (args.category) {
            searchQuery = searchQuery.eq("category", args.category);
          }
          return searchQuery;
        });
    } else if (args.category) {
      query = ctx.db
        .query("books")
        .withIndex("by_collegeId_category", (q) => 
          q.eq("collegeId", args.collegeId).eq("category", args.category)
        );
    } else {
      query = ctx.db
        .query("books")
        .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId));
    }
    
    let books = args.limit ? await query.take(args.limit) : await query.collect();
    
    if (args.availableOnly) {
      books = books.filter(book => book.availableCopies > 0);
    }
    
    return books;
  },
});

export const getBookById = query({
  args: {
    clerkUserId: v.string(),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    
    return book;
  },
});

export const addBook = mutation({
  args: {
    clerkUserId: v.string(),
    title: v.string(),
    author: v.string(),
    isbn: v.optional(v.string()),
    collegeId: v.id("colleges"),
    category: v.optional(v.string()),
    publisher: v.optional(v.string()),
    publishedYear: v.optional(v.number()),
    totalCopies: v.number(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const now = Date.now();
    
    const bookId = await ctx.db.insert("books", {
      title: args.title,
      author: args.author,
      isbn: args.isbn,
      collegeId: args.collegeId,
      category: args.category,
      publisher: args.publisher,
      publishedYear: args.publishedYear,
      totalCopies: args.totalCopies,
      availableCopies: args.totalCopies,
      location: args.location,
      description: args.description,
      imageUrl: args.imageUrl,
      status: "available",
      createdAt: now,
    });
    
    return { success: true, bookId };
  },
});

export const updateBook = mutation({
  args: {
    clerkUserId: v.string(),
    bookId: v.id("books"),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    isbn: v.optional(v.string()),
    category: v.optional(v.string()),
    publisher: v.optional(v.string()),
    publishedYear: v.optional(v.number()),
    totalCopies: v.optional(v.number()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    
    const updates: any = {};
    
    if (args.title !== undefined) updates.title = args.title;
    if (args.author !== undefined) updates.author = args.author;
    if (args.isbn !== undefined) updates.isbn = args.isbn;
    if (args.category !== undefined) updates.category = args.category;
    if (args.publisher !== undefined) updates.publisher = args.publisher;
    if (args.publishedYear !== undefined) updates.publishedYear = args.publishedYear;
    if (args.location !== undefined) updates.location = args.location;
    if (args.description !== undefined) updates.description = args.description;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.status !== undefined) updates.status = args.status;
    
    if (args.totalCopies !== undefined) {
      const diff = args.totalCopies - book.totalCopies;
      updates.totalCopies = args.totalCopies;
      updates.availableCopies = Math.max(0, book.availableCopies + diff);
    }
    
    await ctx.db.patch(args.bookId, updates);
    
    return { success: true };
  },
});

export const deleteBook = mutation({
  args: {
    clerkUserId: v.string(),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    
    const activeBorrows = await ctx.db
      .query("bookBorrows")
      .withIndex("by_bookId", (q) => q.eq("bookId", args.bookId))
      .filter((q) => q.neq(q.field("status"), "returned"))
      .collect();
    
    if (activeBorrows.length > 0) {
      throw new Error("Cannot delete book with active borrows");
    }
    
    await ctx.db.delete(args.bookId);
    
    return { success: true };
  },
});

export const borrowBook = mutation({
  args: {
    clerkUserId: v.string(),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    
    if (book.availableCopies <= 0) {
      throw new Error("No copies available");
    }
    
    const existingBorrow = await ctx.db
      .query("bookBorrows")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "borrowed"))
      .filter((q) => q.eq(q.field("bookId"), args.bookId))
      .first();
    
    if (existingBorrow) {
      throw new Error("You already have this book borrowed");
    }
    
    const now = Date.now();
    const dueDate = now + DUE_DAYS * 24 * 60 * 60 * 1000;
    
    await ctx.db.insert("bookBorrows", {
      bookId: args.bookId,
      userId,
      collegeId: book.collegeId,
      borrowDate: now,
      dueDate,
      status: "borrowed",
      fineAmount: 0,
      finePaid: false,
      createdAt: now,
    });
    
    await ctx.db.patch(args.bookId, {
      availableCopies: book.availableCopies - 1,
    });
    
    await ctx.db.insert("notifications", {
      userId,
      collegeId: book.collegeId,
      type: "library",
      title: "Book Borrowed",
      message: `You borrowed "${book.title}". Due date: ${new Date(dueDate).toLocaleDateString()}`,
      data: { bookId: args.bookId, dueDate },
      isRead: false,
      createdAt: now,
    });
    
    return { success: true, dueDate };
  },
});

export const returnBook = mutation({
  args: {
    clerkUserId: v.string(),
    borrowId: v.id("bookBorrows"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow) {
      throw new Error("Borrow record not found");
    }
    
    if (borrow.userId !== userId && !ADMIN_ONLY.includes(auth.role as any)) {
      throw new Error("Not authorized to return this book");
    }
    
    if (borrow.status === "returned") {
      throw new Error("Book already returned");
    }
    
    const book = await ctx.db.get(borrow.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    
    const now = Date.now();
    const isOverdue = now > borrow.dueDate;
    let fineAmount = 0;
    
    if (isOverdue) {
      const overdueDays = Math.floor((now - borrow.dueDate) / (24 * 60 * 60 * 1000));
      fineAmount = overdueDays * FINE_PER_DAY;
    }
    
    await ctx.db.patch(args.borrowId, {
      returnDate: now,
      status: "returned",
      fineAmount,
      finePaid: fineAmount === 0,
      notes: args.notes,
    });
    
    await ctx.db.patch(borrow.bookId, {
      availableCopies: book.availableCopies + 1,
    });
    
    await ctx.db.insert("notifications", {
      userId: borrow.userId,
      collegeId: borrow.collegeId,
      type: "library",
      title: "Book Returned",
      message: `You returned "${book.title}". ${fineAmount > 0 ? `Fine: ₹${fineAmount}` : ""}`,
      data: { borrowId: args.borrowId, fineAmount },
      isRead: false,
      createdAt: now,
    });
    
    return { success: true, fineAmount };
  },
});

export const payFine = mutation({
  args: {
    clerkUserId: v.string(),
    borrowId: v.id("bookBorrows"),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    const userId = requireAuth(auth);
    
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow) {
      throw new Error("Borrow record not found");
    }
    
    if (borrow.userId !== userId) {
      throw new Error("Not authorized");
    }
    
    if (!borrow.fineAmount || borrow.fineAmount <= 0) {
      throw new Error("No fine to pay");
    }
    
    if (borrow.finePaid) {
      throw new Error("Fine already paid");
    }
    
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    if (wallet.balance < borrow.fineAmount) {
      throw new Error("Insufficient wallet balance");
    }
    
    const now = Date.now();
    const newBalance = wallet.balance - borrow.fineAmount;
    
    await ctx.db.patch(wallet._id, {
      balance: newBalance,
      updatedAt: now,
    });
    
    await ctx.db.insert("walletTransactions", {
      walletId: wallet._id,
      userId,
      collegeId: borrow.collegeId,
      type: "debit",
      amount: borrow.fineAmount,
      category: "library_fine",
      description: `Library fine for overdue book`,
      referenceId: borrow._id,
      referenceType: "bookBorrow",
      balanceAfter: newBalance,
      status: "completed",
      createdAt: now,
    });
    
    await ctx.db.patch(args.borrowId, {
      finePaid: true,
    });
    
    return { success: true, newBalance };
  },
});

export const getUserBorrows = query({
  args: {
    clerkUserId: v.string(),
    status: v.optional(v.union(v.literal("borrowed"), v.literal("returned"), v.literal("overdue"))),
    targetUserId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx, args.clerkUserId);
    requireAuth(auth);
    
    const userId = args.targetUserId || auth.userId!;
    
    if (args.targetUserId && args.targetUserId !== auth.userId) {
      requireRole(auth, ADMIN_ONLY);
    }
    
    let query = ctx.db
      .query("bookBorrows")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc");
    
    let borrows = args.limit ? await query.take(args.limit) : await query.collect();
    
    if (args.status) {
      borrows = borrows.filter(b => b.status === args.status);
    }
    
    const enrichBorrows = await Promise.all(
      borrows.map(async (borrow) => {
        const book = await ctx.db.get(borrow.bookId);
        return {
          ...borrow,
          book,
        };
      })
    );
    
    return enrichBorrows;
  },
});

export const getOverdueBorrows = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const now = Date.now();
    
    const overdueBorrows = await ctx.db
      .query("bookBorrows")
      .withIndex("by_collegeId_status", (q) => 
        q.eq("collegeId", args.collegeId).eq("status", "borrowed")
      )
      .filter((q) => q.lt(q.field("dueDate"), now))
      .take(args.limit || 100);
    
    const enrichBorrows = await Promise.all(
      overdueBorrows.map(async (borrow) => {
        const book = await ctx.db.get(borrow.bookId);
        const user = await ctx.db.get(borrow.userId);
        const overdueDays = Math.floor((now - borrow.dueDate) / (24 * 60 * 60 * 1000));
        const currentFine = overdueDays * FINE_PER_DAY;
        
        return {
          ...borrow,
          book,
          user,
          overdueDays,
          currentFine,
        };
      })
    );
    
    return enrichBorrows;
  },
});

export const extendDueDate = mutation({
  args: {
    clerkUserId: v.string(),
    borrowId: v.id("bookBorrows"),
    additionalDays: v.number(),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow) {
      throw new Error("Borrow record not found");
    }
    
    if (borrow.status !== "borrowed") {
      throw new Error("Cannot extend due date for returned book");
    }
    
    const newDueDate = borrow.dueDate + args.additionalDays * 24 * 60 * 60 * 1000;
    
    await ctx.db.patch(args.borrowId, {
      dueDate: newDueDate,
    });
    
    const book = await ctx.db.get(borrow.bookId);
    
    await ctx.db.insert("notifications", {
      userId: borrow.userId,
      collegeId: borrow.collegeId,
      type: "library",
      title: "Due Date Extended",
      message: `Due date for "${book?.title}" extended by ${args.additionalDays} days`,
      data: { borrowId: args.borrowId, newDueDate },
      isRead: false,
      createdAt: Date.now(),
    });
    
    return { success: true, newDueDate };
  },
});

export const calculateFine = query({
  args: {
    clerkUserId: v.string(),
    borrowId: v.id("bookBorrows"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow) {
      throw new Error("Borrow record not found");
    }
    
    const now = Date.now();
    
    if (now <= borrow.dueDate) {
      return {
        isOverdue: false,
        overdueDays: 0,
        fineAmount: 0,
      };
    }
    
    const overdueDays = Math.floor((now - borrow.dueDate) / (24 * 60 * 60 * 1000));
    const fineAmount = overdueDays * FINE_PER_DAY;
    
    return {
      isOverdue: true,
      overdueDays,
      fineAmount,
    };
  },
});

export const markOverdueBooks = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    const overdueBorrows = await ctx.db
      .query("bookBorrows")
      .withIndex("by_dueDate", (q) => q.lt("dueDate", now))
      .filter((q) => q.eq(q.field("status"), "borrowed"))
      .collect();
    
    for (const borrow of overdueBorrows) {
      await ctx.db.patch(borrow._id, {
        status: "overdue",
      });
    }
    
    return { marked: overdueBorrows.length };
  },
});

export const getLibraryStats = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const books = await ctx.db
      .query("books")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
    
    const borrows = await ctx.db
      .query("bookBorrows")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
    
    const now = Date.now();
    
    const stats = {
      totalBooks: books.length,
      totalCopies: books.reduce((sum, b) => sum + b.totalCopies, 0),
      availableCopies: books.reduce((sum, b) => sum + b.availableCopies, 0),
      borrowedCopies: 0,
      activeBorrows: 0,
      overdueBorrows: 0,
      totalFines: 0,
      unpaidFines: 0,
    };
    
    for (const borrow of borrows) {
      if (borrow.status === "borrowed" || borrow.status === "overdue") {
        stats.activeBorrows++;
        stats.borrowedCopies++;
        
        if (borrow.dueDate < now) {
          stats.overdueBorrows++;
        }
      }
      
      if (borrow.fineAmount) {
        stats.totalFines += borrow.fineAmount;
        if (!borrow.finePaid) {
          stats.unpaidFines += borrow.fineAmount;
        }
      }
    }
    
    return stats;
  },
});

export const getCategories = query({
  args: {
    clerkUserId: v.string(),
    collegeId: v.id("colleges"),
  },
  handler: async (ctx, args) => {
    requireAuth(await getAuth(ctx, args.clerkUserId));
    
    const books = await ctx.db
      .query("books")
      .withIndex("by_collegeId", (q) => q.eq("collegeId", args.collegeId))
      .collect();
    
    const categories = new Map<string, number>();
    
    for (const book of books) {
      const category = book.category || "Uncategorized";
      categories.set(category, (categories.get(category) || 0) + 1);
    }
    
    return Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  },
});

export const sendDueReminder = mutation({
  args: {
    clerkUserId: v.string(),
    borrowId: v.id("bookBorrows"),
  },
  handler: async (ctx, args) => {
    requireRole(await getAuth(ctx, args.clerkUserId), ADMIN_ONLY);
    
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow) {
      throw new Error("Borrow record not found");
    }
    
    if (borrow.status !== "borrowed" && borrow.status !== "overdue") {
      throw new Error("Book already returned");
    }
    
    const book = await ctx.db.get(borrow.bookId);
    const now = Date.now();
    const isOverdue = now > borrow.dueDate;
    
    await ctx.db.insert("notifications", {
      userId: borrow.userId,
      collegeId: borrow.collegeId,
      type: "library",
      title: isOverdue ? "Book Overdue" : "Due Date Reminder",
      message: isOverdue
        ? `"${book?.title}" is overdue. Please return it to avoid additional fines.`
        : `"${book?.title}" is due on ${new Date(borrow.dueDate).toLocaleDateString()}`,
      data: { borrowId: args.borrowId, dueDate: borrow.dueDate },
      isRead: false,
      createdAt: now,
    });
    
    return { success: true };
  },
});
