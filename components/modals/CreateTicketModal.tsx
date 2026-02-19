"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button-new";
import { Input, Textarea, Select } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Id } from "@/convex/_generated/dataModel";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId: Id<"colleges">;
  clerkUserId: string;
  onSuccess?: () => void;
}

type TicketCategory = "technical" | "academic" | "facility" | "hostel" | "other";
type TicketPriority = "low" | "medium" | "high" | "urgent";

export function CreateTicketModal({ isOpen, onClose, collegeId, clerkUserId, onSuccess }: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("technical");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = useMutation(api.tickets.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createTicket({
        clerkUserId,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        collegeId,
      });

      setTitle("");
      setDescription("");
      setCategory("technical");
      setPriority("medium");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    { value: "technical", label: "Technical" },
    { value: "academic", label: "Academic" },
    { value: "facility", label: "Facility" },
    { value: "hostel", label: "Hostel" },
    { value: "other", label: "Other" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard variant="elevated" className="w-full max-w-lg">
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Create New Ticket</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
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
                    label="Title"
                    placeholder="Brief description of your issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Textarea
                    label="Description"
                    placeholder="Provide detailed information about your issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TicketCategory)}
                      options={categoryOptions}
                    />

                    <Select
                      label="Priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TicketPriority)}
                      options={priorityOptions}
                    />
                  </div>
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
                        Creating...
                      </>
                    ) : (
                      "Create Ticket"
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
