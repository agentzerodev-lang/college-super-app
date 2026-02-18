"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Book, 
  User, 
  Calendar, 
  MapPin,
  Bookmark,
  AlertCircle
} from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  isBorrowed?: boolean;
  dueDate?: number;
  borrowId?: string;
  onBorrow?: () => void;
  onReturn?: () => void;
  onViewDetails?: () => void;
}

export function BookCard({
  id,
  title,
  author,
  isbn,
  category,
  publisher,
  publishedYear,
  totalCopies,
  availableCopies,
  location,
  description,
  imageUrl,
  status = "available",
  isBorrowed = false,
  dueDate,
  borrowId,
  onBorrow,
  onReturn,
  onViewDetails,
}: BookCardProps) {
  const isAvailable = availableCopies > 0 && status === "available";
  const isOverdue = dueDate && dueDate < Date.now();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-28 md:w-24 md:h-32 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {author}
              </p>
            </div>
            {isBorrowed && (
              <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${isOverdue ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
                {isOverdue ? "Overdue" : "Borrowed"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {category}
              </span>
            )}
            {publishedYear && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {publishedYear}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
              {description}
            </p>
          )}

          {isBorrowed && dueDate && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${isOverdue ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
              {isOverdue ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              <span>
                {isOverdue ? "Overdue since" : "Due"}: {formatDate(dueDate)}
              </span>
            </div>
          )}

          {!isBorrowed && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Bookmark className="w-3 h-3" />
                <span>{availableCopies}/{totalCopies} available</span>
              </div>
              {location && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {isBorrowed && onReturn ? (
              <Button onClick={onReturn} variant="danger" size="sm" className="flex-1">
                Return Book
              </Button>
            ) : isAvailable && onBorrow ? (
              <Button onClick={onBorrow} variant="primary" size="sm" className="flex-1">
                Borrow
              </Button>
            ) : (
              <span className="text-xs text-red-500 font-medium">Not Available</span>
            )}
            {onViewDetails && (
              <Button onClick={onViewDetails} variant="secondary" size="sm">
                Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
