"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Book, User, Hash, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button-new";
import { Input, Textarea } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Id } from "@/convex/_generated/dataModel";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId: Id<"colleges">;
  clerkUserId: string;
  onSuccess?: () => void;
}

export function AddBookModal({ isOpen, onClose, collegeId, clerkUserId, onSuccess }: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [totalCopies, setTotalCopies] = useState("1");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBook = useMutation(api.library.addBook);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim()) {
      setError("Title and author are required");
      return;
    }

    if (!totalCopies || parseInt(totalCopies) < 1) {
      setError("At least 1 copy is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addBook({
        clerkUserId,
        title: title.trim(),
        author: author.trim(),
        collegeId,
        isbn: isbn.trim() || undefined,
        category: category.trim() || undefined,
        publisher: publisher.trim() || undefined,
        publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
        totalCopies: parseInt(totalCopies),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });

      setTitle("");
      setAuthor("");
      setIsbn("");
      setCategory("");
      setPublisher("");
      setPublishedYear("");
      setTotalCopies("1");
      setLocation("");
      setDescription("");
      setImageUrl("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add book");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-xl"
          >
            <GlassCard variant="elevated">
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Add New Book</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-500 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Input
                    label="Title *"
                    placeholder="Book title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    leftIcon={<Book className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Author *"
                    placeholder="Author name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ISBN"
                      placeholder="ISBN number"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      leftIcon={<Hash className="w-4 h-4" />}
                    />
                    <Input
                      label="Category"
                      placeholder="e.g., Fiction, Science"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Publisher"
                      placeholder="Publisher name"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                    />
                    <Input
                      label="Published Year"
                      type="number"
                      placeholder="e.g., 2024"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Copies *"
                      type="number"
                      min="1"
                      value={totalCopies}
                      onChange={(e) => setTotalCopies(e.target.value)}
                      leftIcon={<Package className="w-4 h-4" />}
                      required
                    />
                    <Input
                      label="Location"
                      placeholder="Shelf/Section"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  <Textarea
                    label="Description"
                    placeholder="Brief description of the book..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />

                  <Input
                    label="Cover Image URL"
                    placeholder="https://example.com/cover.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="p-6 border-t border-white/5 flex gap-3">
                  <Button
                    type="button"
                    variant="glass"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={isLoading}
                    glow
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Book"
                    )}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
