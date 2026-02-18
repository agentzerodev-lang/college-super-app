"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TimetableGrid } from "@/components/features/TimetableGrid";
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  Download,
  Bell
} from "lucide-react";

interface TimetableEntry {
  _id: string;
  courseId: string;
  classroomId: string;
  facultyId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  course?: {
    _id: string;
    name: string;
    code: string;
  } | null;
  classroom?: {
    _id: string;
    name: string;
    building: string;
  } | null;
  faculty?: {
    _id: string;
    name: string;
  } | null;
}

export default function TimetablePage() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const weeklyTimetable = useQuery(
    api.timetable.getWeeklyTimetable,
    currentUser?.collegeId
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId }
      : "skip"
  );

  const nextClass = useQuery(
    api.timetable.getNextClass,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const isStaff = currentUser?.role === "faculty" || 
                  currentUser?.role === "admin" || 
                  currentUser?.role === "hostelAdmin" ||
                  currentUser?.role === "canteenAdmin";

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Timetable
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {currentUser?.role === "faculty" 
              ? "Your teaching schedule for the week"
              : "Your class schedule for the week"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {isStaff && (
            <Button variant="primary" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>
      </div>

      {nextClass && (
        <Card className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
                  {nextClass.isToday ? "Today" : `In ${nextClass.daysUntil} day${nextClass.daysUntil > 1 ? "s" : ""}`}
                </span>
              </div>
              <h3 className="text-xl font-semibold">
                {nextClass.course?.name || "Unknown Course"}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(nextClass.startTime)} - {formatTime(nextClass.endTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {nextClass.classroom?.name || "TBA"}, {nextClass.classroom?.building || ""}
                </span>
                {currentUser?.role !== "faculty" && nextClass.faculty && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {nextClass.faculty.name}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Bell className="w-4 h-4 mr-2" />
                Set Reminder
              </Button>
            </div>
          </div>
        </Card>
      )}

      {weeklyTimetable === undefined ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 mt-4">
            Loading your timetable...
          </p>
        </Card>
      ) : weeklyTimetable.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No timetable entries found
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {currentUser?.role === "student"
              ? "Your class schedule will appear here once configured"
              : "Create timetable entries to get started"}
          </p>
          {isStaff && (
            <Button variant="primary" className="mt-4">
              Create Timetable Entry
            </Button>
          )}
        </Card>
      ) : (
        <TimetableGrid
          entries={(weeklyTimetable as TimetableEntry[]).map((entry) => ({
            _id: entry._id,
            courseId: entry.courseId,
            classroomId: entry.classroomId,
            facultyId: entry.facultyId,
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
            course: entry.course,
            classroom: entry.classroom,
            faculty: entry.faculty,
          }))}
          onEntryClick={(entry) => {
            console.log("Entry clicked:", entry);
          }}
        />
      )}

      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {weeklyTimetable?.length ?? 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Classes
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {(weeklyTimetable as TimetableEntry[] | undefined)?.filter((e) => e.dayOfWeek === new Date().getDay()).length ?? 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Today&apos;s Classes
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {new Set((weeklyTimetable as TimetableEntry[] | undefined)?.map((e) => e.courseId)).size ?? 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unique Courses
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(weeklyTimetable as TimetableEntry[] | undefined)?.filter((e) => e.dayOfWeek >= 1 && e.dayOfWeek <= 5).length ?? 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Weekday Classes
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
