"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button-new";
import { Input, Textarea, Select } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Id } from "@/convex/_generated/dataModel";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId: Id<"colleges">;
  clerkUserId: string;
  onSuccess?: () => void;
}

type EventType = "academic" | "cultural" | "sports" | "workshop" | "seminar" | "competition" | "other";

export function CreateEventModal({ isOpen, onClose, collegeId, clerkUserId, onSuccess }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("academic");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [fee, setFee] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useMutation(api.events.createEvent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !startDate || !startTime) {
      setError("Please fill in all required fields");
      return;
    }

    const startTimestamp = new Date(`${startDate}T${startTime}`).getTime();
    const endTimestamp = endDate && endTime 
      ? new Date(`${endDate}T${endTime}`).getTime()
      : startTimestamp + 3600000;

    if (endTimestamp <= startTimestamp) {
      setError("End time must be after start time");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createEvent({
        clerkUserId,
        title: title.trim(),
        description: description.trim(),
        type,
        startTime: startTimestamp,
        endTime: endTimestamp,
        collegeId,
        location: location.trim() || undefined,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        fee: fee ? parseFloat(fee) : undefined,
        isFree: !fee || parseFloat(fee) === 0,
        tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        isPublic,
      });

      setTitle("");
      setDescription("");
      setType("academic");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setLocation("");
      setMaxAttendees("");
      setFee("");
      setTags("");
      setIsPublic(true);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: "academic", label: "Academic" },
    { value: "cultural", label: "Cultural" },
    { value: "sports", label: "Sports" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
    { value: "competition", label: "Competition" },
    { value: "other", label: "Other" },
  ];

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
                    <h2 className="text-xl font-semibold text-white">Create New Event</h2>
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
                    label="Event Title"
                    placeholder="Enter event title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Textarea
                    label="Description"
                    placeholder="Describe your event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />

                  <Select
                    label="Event Type"
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    options={typeOptions}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Start Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/30 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Start Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/30 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <Input
                    label="Location"
                    placeholder="Event venue"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Max Attendees"
                      type="number"
                      placeholder="Unlimited"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      leftIcon={<Users className="w-4 h-4" />}
                    />
                    <Input
                      label="Fee (₹)"
                      type="number"
                      placeholder="Free"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                  </div>

                  <Input
                    label="Tags"
                    placeholder="Separate with commas: tech, workshop, ai"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-dark-800/50 text-primary-500 focus:ring-primary-500/30"
                    />
                    <span className="text-sm text-slate-300">Public event (visible to everyone)</span>
                  </label>
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
                      "Create Event"
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
