"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  ChevronRight
} from "lucide-react";

interface AttendanceCardProps {
  courseName: string;
  courseCode: string;
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    attendancePercentage: number;
  };
  recentRecords?: Array<{
    date: number;
    status: "present" | "absent" | "late";
  }>;
  canMark?: boolean;
  onMarkAttendance?: () => void;
  onViewDetails?: () => void;
}

const statusConfig = {
  present: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  absent: { icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  late: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
};

function getAttendanceColor(percentage: number): string {
  if (percentage >= 75) return "text-green-500";
  if (percentage >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getAttendanceBg(percentage: number): string {
  if (percentage >= 75) return "bg-green-100 dark:bg-green-900/30";
  if (percentage >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

export function AttendanceCard({
  courseName,
  courseCode,
  stats,
  recentRecords = [],
  canMark = false,
  onMarkAttendance,
  onViewDetails,
}: AttendanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const attendanceColor = getAttendanceColor(stats.attendancePercentage);
  const attendanceBg = getAttendanceBg(stats.attendancePercentage);

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {courseCode}
            </p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {courseName}
            </h3>
          </div>
          <div className={`px-3 py-1.5 rounded-full ${attendanceBg}`}>
            <span className={`text-lg font-bold ${attendanceColor}`}>
              {stats.attendancePercentage}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {stats.present}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Present</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {stats.absent}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Absent</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.late}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Late</p>
          </div>
        </div>

        {recentRecords.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent attendance
            </span>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}

        {isExpanded && recentRecords.length > 0 && (
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {recentRecords.slice(0, 7).map((record, index) => {
              const config = statusConfig[record.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {formatDate(record.date)}
                  </span>
                  <span className={`flex items-center gap-1 ${config.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-xs capitalize">{record.status}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {canMark && (
            <Button onClick={onMarkAttendance} variant="primary" size="sm" className="flex-1">
              Mark Attendance
            </Button>
          )}
          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              View Details
            </Button>
          )}
        </div>
      </div>

      <div className="h-1 bg-slate-100 dark:bg-slate-700">
        <div
          className={`h-full transition-all duration-300 ${
            stats.attendancePercentage >= 75
              ? "bg-green-500"
              : stats.attendancePercentage >= 60
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${stats.attendancePercentage}%` }}
        />
      </div>
    </Card>
  );
}
