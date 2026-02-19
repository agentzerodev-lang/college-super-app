"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button-new";
import { cn } from "@/lib/utils";
import { spring } from "@/components/motion/variants";
import { 
  Book, 
  User, 
  Calendar, 
  MapPin,
  Bookmark,
  AlertCircle
} from "lucide-react";

interface BookCardProps {
  id?: string;
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
  title,
  author,
  category,
  totalCopies,
  availableCopies,
  location,
  description,
  imageUrl,
  status = "available",
  isBorrowed = false,
  dueDate,
  publishedYear,
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
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={spring}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "backdrop-blur-xl bg-dark-800/50",
        "border border-white/5",
        "transition-all duration-300",
        "hover:border-white/10 hover:bg-dark-800/70",
        "shadow-glass hover:shadow-glass-lg"
      )}
    >
      <div className="flex gap-4 p-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden bg-dark-700/50 shrink-0 border border-white/5"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="w-8 h-8 text-slate-600" />
            </div>
          )}
        </motion.div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                <User className="w-3 h-3" />
                {author}
              </p>
            </div>
            {isBorrowed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "shrink-0 text-xs px-3 py-1 rounded-full font-medium",
                  isOverdue 
                    ? "bg-error-500/20 text-error-500" 
                    : "bg-primary-500/20 text-primary-400"
                )}
              >
                {isOverdue ? "Overdue" : "Borrowed"}
              </motion.span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {category && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 font-medium">
                {category}
              </span>
            )}
            {publishedYear && (
              <span className="text-xs text-slate-500">
                {publishedYear}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-2">
              {description}
            </p>
          )}

          {isBorrowed && dueDate && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              isOverdue ? "text-error-500" : "text-slate-500"
            )}>
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
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Bookmark className="w-3 h-3" />
                <span>{availableCopies}/{totalCopies} available</span>
              </div>
              {location && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-auto pt-3">
            {isBorrowed && onReturn ? (
              <Button onClick={onReturn} variant="danger" size="sm" className="flex-1">
                Return Book
              </Button>
            ) : isAvailable && onBorrow ? (
              <Button onClick={onBorrow} variant="primary" size="sm" className="flex-1" glow>
                Borrow
              </Button>
            ) : (
              <span className="text-xs text-error-500 font-medium">Not Available</span>
            )}
            {onViewDetails && (
              <Button onClick={onViewDetails} variant="glass" size="sm">
                Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
