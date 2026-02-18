"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Calendar,
  Clock,
  Users,
  Ticket,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { QuickStats } from "./QuickStats";
import { FeatureCard } from "./FeatureCard";

export function FacultyDashboard() {
  const { profile } = useCurrentUser();
  const collegeId = profile?.collegeId as Id<"colleges"> | undefined;

  const dashboardData = useQuery(
    api.dashboard.getFacultyDashboard,
    profile?.clerkUserId && collegeId
      ? { clerkUserId: profile.clerkUserId, collegeId }
      : "skip"
  );

  if (!profile) return null;

  const isLoading = dashboardData === undefined;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const stats = dashboardData
    ? [
        {
          label: "Today's Classes",
          value: dashboardData.todayClasses.length,
          icon: Calendar,
          color: "indigo" as const,
        },
        {
          label: "Attendance Marked",
          value: `${dashboardData.attendanceStats.today.present}/${dashboardData.attendanceStats.today.total}`,
          icon: CheckCircle,
          color: "emerald" as const,
        },
        {
          label: "Assigned Tickets",
          value: dashboardData.assignedTickets.length,
          icon: Ticket,
          color: "amber" as const,
        },
        {
          label: "Overall Attendance",
          value: dashboardData.attendanceStats.overall.total
            ? `${Math.round(
                (dashboardData.attendanceStats.overall.present /
                  dashboardData.attendanceStats.overall.total) *
                  100
              )}%`
            : "N/A",
          icon: Users,
          color: "teal" as const,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Record student attendance",
      icon: CheckCircle,
      href: "/attendance/mark",
      color: "emerald" as const,
    },
    {
      title: "My Schedule",
      description: "View teaching timetable",
      icon: Calendar,
      href: "/schedule",
      color: "indigo" as const,
    },
    {
      title: "My Courses",
      description: "Manage course materials",
      icon: BookOpen,
      href: "/courses",
      color: "purple" as const,
    },
    {
      title: "Support Tickets",
      description: "Handle assigned tickets",
      icon: Ticket,
      href: "/tickets",
      color: "amber" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {profile.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Faculty Dashboard
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <QuickStats stats={stats} />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Today&apos;s Classes
            </h2>
            <Link
              href="/schedule"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData?.todayClasses?.length ? (
            <div className="space-y-3">
              {dashboardData.todayClasses.map((slot, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    slot.isOngoing
                      ? "bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800"
                      : slot.isCompleted
                      ? "bg-slate-50 dark:bg-slate-800/50"
                      : "bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center w-16 text-center">
                    <Clock
                      className={`w-4 h-4 ${
                        slot.isOngoing
                          ? "text-indigo-600 dark:text-indigo-400"
                          : slot.isCompleted
                          ? "text-slate-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatTime(slot.startTime)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        slot.isCompleted
                          ? "text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {slot.course?.name || "Unknown Course"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {slot.classroom?.name || "TBA"}
                    </p>
                  </div>
                  {slot.isOngoing && (
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-600 text-white rounded-full animate-pulse">
                      Ongoing
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No classes scheduled for today</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Today&apos;s Attendance
            </h2>
            <Link
              href="/attendance"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {dashboardData?.attendanceStats?.today?.present || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Present
                  </p>
                </div>
                <div className="text-center p-4 bg-rose-50 dark:bg-rose-950 rounded-lg">
                  <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {dashboardData?.attendanceStats?.today?.absent || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Absent
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {dashboardData?.attendanceStats?.today?.late || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Late
                  </p>
                </div>
              </div>
              <Link
                href="/attendance/mark"
                className="block w-full py-3 text-center btn-primary"
              >
                Mark Attendance
              </Link>
            </div>
          )}
        </div>
      </div>

      {dashboardData?.assignedTickets?.length ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Assigned Tickets
            </h2>
            <Link
              href="/tickets"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {dashboardData.assignedTickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket._id}
                href={`/tickets/${ticket._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {ticket.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {ticket.category} • {ticket.priority} priority
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    ticket.status === "open"
                      ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                      : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <FeatureCard key={action.href} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
}
