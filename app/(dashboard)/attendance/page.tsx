"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AttendanceCard } from "@/components/features/AttendanceCard";
import { UploadAttendanceModal } from "@/components/modals/UploadAttendanceModal";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Upload
} from "lucide-react";

interface AttendanceRecord {
  _id: string;
  userId: string;
  courseId: string;
  studentSubjectId?: string;
  date: number;
  status: "present" | "absent" | "late";
  course?: {
    _id: string;
    name: string;
    code: string;
  } | null;
  studentSubject?: {
    _id: string;
    name: string;
    code: string;
  } | null;
}

interface CourseData {
  courseId: string;
  course: {
    _id: string;
    name: string;
    code: string;
  } | null;
  records: AttendanceRecord[];
}

export default function AttendancePage() {
  const { user } = useUser();
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const attendanceRecords = useQuery(
    api.attendance.getStudentAttendance,
    currentUser?._id ? { clerkUserId: user!.id, studentId: currentUser._id } : "skip"
  );

  const attendanceStats = useQuery(
    api.attendance.getAttendanceStats,
    currentUser?._id ? { clerkUserId: user!.id, studentId: currentUser._id } : "skip"
  );

  const isFacultyOrAdmin = currentUser?.role === "faculty" || currentUser?.role === "admin";

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case "today":
        return { start: today.getTime(), end: today.getTime() + 86400000 };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return { start: weekStart.getTime(), end: now.getTime() };
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart.getTime(), end: now.getTime() };
      default:
        return null;
    }
  };

  const filteredRecords = (attendanceRecords as AttendanceRecord[] | undefined) && dateFilter !== "all"
    ? (attendanceRecords as AttendanceRecord[]).filter((record) => {
        const range = getDateRange();
        if (!range) return true;
        return record.date >= range.start && record.date <= range.end;
      })
    : attendanceRecords as AttendanceRecord[] | undefined;

  const groupedByCourse = filteredRecords?.reduce((acc, record) => {
    // Use either courseId or studentSubjectId as the grouping key
    const key = record.courseId || record.studentSubjectId;
    if (!key) return acc; // Skip records without valid key
    
    if (!acc[key]) {
      acc[key] = {
        courseId: key,
        course: record.course ?? record.studentSubject ?? null,
        records: [],
      };
    }
    acc[key].records.push(record);
    return acc;
  }, {} as Record<string, CourseData>);

  const getCourseStats = (records: AttendanceRecord[]) => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    return {
      total,
      present,
      absent,
      late,
      attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
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
            Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your class attendance across all courses
          </p>
        </div>

        {isFacultyOrAdmin && (
          <Button variant="primary">
            <Users className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        )}

        {currentUser?.role === "student" && (
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Attendance
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendanceStats?.present ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Present</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendanceStats?.absent ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Absent</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendanceStats?.late ?? 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Late</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {attendanceStats?.attendancePercentage ?? 0}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Overall</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
          {(["today", "week", "month", "all"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                dateFilter === filter
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Course-wise Attendance
        </h2>

        {groupedByCourse && Object.keys(groupedByCourse).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(groupedByCourse).map((courseData) => {
              const courseInfo = courseData.course as any;
              const displayName = courseInfo?.name || "Custom Subject";
              const displayCode = courseInfo?.code || "N/A";
              return (
                <AttendanceCard
                  key={courseData.courseId}
                  courseName={displayName}
                  courseCode={displayCode}
                  stats={getCourseStats(courseData.records)}
                  recentRecords={courseData.records.slice(-7).reverse()}
                  canMark={isFacultyOrAdmin}
                />
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No attendance records found
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Your attendance will appear here once marked
            </p>
          </Card>
        )}
      </div>

      {attendanceStats && attendanceStats.attendancePercentage < 75 && (
        <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Low Attendance Warning
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Your overall attendance is below 75%. Please ensure regular class attendance to meet academic requirements.
              </p>
            </div>
          </div>
        </Card>
      )}

      <UploadAttendanceModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        clerkUserId={user!.id}
      />
    </div>
  );
}
