"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  X,
  Loader2,
  Building,
} from "lucide-react";

interface BookClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: {
    _id: string;
    name: string;
    building: string;
    floor: number;
    capacity: number;
  };
  collegeId: Id<"colleges">;
  clerkUserId: string;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  onSuccess?: () => void;
}

export function BookClassroomModal({
  isOpen,
  onClose,
  classroom,
  collegeId,
  clerkUserId,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSuccess,
}: BookClassroomModalProps) {
  const [bookedFor, setBookedFor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookClassroom = useMutation(api.timetable.bookFreeClassroom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dateTimestamp = new Date(selectedDate).getTime();
      
      await bookClassroom({
        clerkUserId,
        classroomId: classroom._id as Id<"classrooms">,
        collegeId,
        date: dateTimestamp,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        bookedFor: bookedFor.trim() || undefined,
      });

      setBookedFor("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to book classroom:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Book Classroom
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Building className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {classroom.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {classroom.building} - Floor {classroom.floor}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purpose (optional)
              </label>
              <input
                type="text"
                value={bookedFor}
                onChange={(e) => setBookedFor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary"
                placeholder="E.g., Group study, Project discussion"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
