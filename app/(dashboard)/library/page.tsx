"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookCard } from "@/components/features/BookCard";
import { AddBookModal } from "@/components/modals/AddBookModal";
import { 
  Book,
  Search,
  Bookmark,
  Clock,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";

export default function LibraryPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "borrowed">("browse");
  const [showAddModal, setShowAddModal] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const books = useQuery(
    api.library.getBooks,
    currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          collegeId: currentUser.collegeId,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          availableOnly: showOnlyAvailable,
        }
      : "skip"
  );

  const userBorrows = useQuery(
    api.library.getUserBorrows,
    { clerkUserId: user?.id || "" }
  );

  const categories = useQuery(
    api.library.getCategories,
    currentUser?.collegeId ? { clerkUserId: user!.id, collegeId: currentUser.collegeId } : "skip"
  );

  const libraryStats = useQuery(
    api.library.getLibraryStats,
    currentUser?.collegeId ? { clerkUserId: user!.id, collegeId: currentUser.collegeId } : "skip"
  );

  const borrowBook = useMutation(api.library.borrowBook);
  const returnBook = useMutation(api.library.returnBook);

  const isAdmin = currentUser?.role === "admin";

  const handleBorrow = async (bookId: string) => {
    await borrowBook({
      clerkUserId: user!.id,
      bookId: bookId as any,
    });
  };

  const handleReturn = async (borrowId: string) => {
    await returnBook({
      clerkUserId: user!.id,
      borrowId: borrowId as any,
    });
  };

  const overdueBorrows = userBorrows?.filter(
    (b) => b.status === "borrowed" && b.dueDate < Date.now()
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse and borrow books from the library
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        )}
      </div>

      {libraryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Book className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {libraryStats.totalBooks}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Books</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Bookmark className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {libraryStats.availableCopies}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {libraryStats.activeBorrows}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Borrowed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {libraryStats.overdueBorrows}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overdue</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === "browse"
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Browse Books
        </button>
        <button
          onClick={() => setActiveTab("borrowed")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === "borrowed"
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          My Borrowed Books
          {overdueBorrows && overdueBorrows.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {overdueBorrows.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "browse" && (
        <>
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex gap-2 items-center">
                {categories && categories.length > 0 && (
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showOnlyAvailable}
                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Available only
                </label>
              </div>
            </div>
          </Card>

          {books && books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  id={book._id}
                  title={book.title}
                  author={book.author}
                  isbn={book.isbn}
                  category={book.category}
                  publisher={book.publisher}
                  publishedYear={book.publishedYear}
                  totalCopies={book.totalCopies}
                  availableCopies={book.availableCopies}
                  location={book.location}
                  description={book.description}
                  imageUrl={book.imageUrl}
                  status={book.status}
                  onBorrow={() => handleBorrow(book._id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Book className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No books found
              </p>
            </Card>
          )}
        </>
      )}

      {activeTab === "borrowed" && (
        <>
          {userBorrows && userBorrows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBorrows.map((borrow) => (
                <BookCard
                  key={borrow._id}
                  id={borrow.bookId}
                  title={borrow.book?.title || "Unknown"}
                  author={borrow.book?.author || "Unknown"}
                  category={borrow.book?.category}
                  totalCopies={borrow.book?.totalCopies || 0}
                  availableCopies={0}
                  description={borrow.book?.description}
                  imageUrl={borrow.book?.imageUrl}
                  isBorrowed={true}
                  dueDate={borrow.dueDate}
                  borrowId={borrow._id}
                  onReturn={() => handleReturn(borrow._id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                You haven't borrowed any books
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setActiveTab("browse")}
              >
                Browse Books
              </Button>
            </Card>
          )}
        </>
      )}

      {currentUser?.collegeId && (
        <AddBookModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          collegeId={currentUser.collegeId}
          clerkUserId={user!.id}
          onSuccess={() => {
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
