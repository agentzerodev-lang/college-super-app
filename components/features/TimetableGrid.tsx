"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
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

interface TimetableGridProps {
  entries: TimetableEntry[];
  onEntryClick?: (entry: TimetableEntry) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const COLORS = [
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-300 dark:border-indigo-700", text: "text-indigo-700 dark:text-indigo-300" },
  { bg: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-300 dark:border-teal-700", text: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-700 dark:text-orange-300" },
  { bg: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-300 dark:border-pink-700", text: "text-pink-700 dark:text-pink-300" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-700 dark:text-cyan-300" },
];

function getCourseColor(courseId: string) {
  const hash = courseId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

function getCurrentDayOfWeek(): number {
  return new Date().getDay();
}

function getCurrentTimeSlot(): string {
  const now = new Date();
  const hours = now.getHours();
  return `${hours.toString().padStart(2, "0")}:00`;
}

function isCurrentClass(entry: TimetableEntry, currentDay: number): boolean {
  if (entry.dayOfWeek !== currentDay) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = entry.startTime.split(":").map(Number);
  const [endH, endM] = entry.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function TimetableGrid({
  entries,
  onEntryClick,
}: TimetableGridProps) {
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(getCurrentDayOfWeek());
  
  const currentDay = getCurrentDayOfWeek();
  const currentTime = getCurrentTimeSlot();

  const getEntriesForDayAndTime = (day: number, time: string) => {
    return entries.filter(
      (entry) =>
        entry.dayOfWeek === day &&
        entry.startTime <= time &&
        entry.endTime > time
    );
  };

  const navigateDay = (direction: "prev" | "next") => {
    setSelectedDay((prev) => {
      if (direction === "prev") return prev === 0 ? 6 : prev - 1;
      return prev === 6 ? 0 : prev + 1;
    });
  };

  const renderEntryCard = (entry: TimetableEntry, showDay?: boolean) => {
    const color = getCourseColor(entry.courseId);
    const isNow = isCurrentClass(entry, currentDay);
    
    return (
      <div
        key={entry._id}
        onClick={() => onEntryClick?.(entry)}
        className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          color.bg
        } ${color.border} ${isNow ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm truncate ${color.text}`}>
              {entry.course?.name || "Unknown Course"}
            </p>
            {showDay && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {FULL_DAYS[entry.dayOfWeek]}
              </p>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 shrink-0">
            {entry.startTime}-{entry.endTime}
          </span>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              {entry.classroom?.name || "TBA"} ({entry.classroom?.building || ""})
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <User className="w-3 h-3" />
            <span className="truncate">{entry.faculty?.name || "TBA"}</span>
          </div>
        </div>

        {isNow && (
          <div className="mt-2 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Now
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Timetable
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "week"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "day"
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "day" && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDay("prev")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {FULL_DAYS[selectedDay]}
            </h3>
            <button
              onClick={() => navigateDay("next")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {viewMode === "week" ? (
          <div className="min-w-[768px]">
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
              <div className="p-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                Time
              </div>
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className={`p-2 text-center text-sm font-medium ${
                    index === currentDay
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className={`grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 ${
                  time === currentTime ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                }`}
              >
                <div className="p-2 text-center text-sm text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                  {time}
                </div>
                {DAYS.map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="p-1 min-h-[60px] border-r border-slate-100 dark:border-slate-800"
                  >
                    {getEntriesForDayAndTime(dayIndex, time)
                      .filter(
                        (entry) => entry.startTime === time
                      )
                      .map((entry) => renderEntryCard(entry))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {TIME_SLOTS.map((time) => {
              const dayEntries = getEntriesForDayAndTime(selectedDay, time).filter(
                (entry) => entry.startTime === time
              );
              
              if (dayEntries.length === 0) return null;
              
              return (
                <div key={time}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {time}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayEntries.map((entry) => renderEntryCard(entry))}
                  </div>
                </div>
              );
            })}

            {getEntriesForDayAndTime(selectedDay, "08:00").length === 0 &&
              TIME_SLOTS.every(
                (time) => getEntriesForDayAndTime(selectedDay, time).length === 0
              ) && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No classes scheduled for {FULL_DAYS[selectedDay]}
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </Card>
  );
}
