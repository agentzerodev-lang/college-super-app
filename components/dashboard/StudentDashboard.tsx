"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Calendar,
  Clock,
  Ticket,
  Event,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Library,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "./FeatureCard";
import { QuickStats } from "./QuickStats";

export function StudentDashboard() {
  const { profile } = useCurrentUser();
  const collegeId = profile?.collegeId as Id<"colleges"> | undefined;

  const dashboardData = useQuery(
    api.dashboard.getStudentDashboard,
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
          value: dashboardData.todaySchedule.length,
          icon: Calendar,
          color: "indigo" as const,
        },
        {
          label: "Attendance Today",
          value: `${dashboardData.attendanceStats.present}/${dashboardData.attendanceStats.total}`,
          icon: CheckCircle,
          color: "emerald" as const,
        },
        {
          label: "Pending Tickets",
          value: dashboardData.pendingTickets.length,
          icon: Ticket,
          color: "amber" as const,
        },
        {
          label: "Wallet Balance",
          value: `₹${dashboardData.walletBalance}`,
          icon: Wallet,
          color: "teal" as const,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Class Schedule",
      description: "View your timetable",
      icon: Calendar,
      href: "/schedule",
      color: "indigo" as const,
    },
    {
      title: "Attendance",
      description: "Check your attendance",
      icon: CheckCircle,
      href: "/attendance",
      color: "emerald" as const,
    },
    {
      title: "Canteen",
      description: "Order food online",
      icon: Utensils,
      href: "/canteen",
      color: "amber" as const,
      badge: dashboardData?.activeOrders?.length
        ? `${dashboardData.activeOrders.length} active`
        : undefined,
    },
    {
      title: "Library",
      description: "Browse and borrow books",
      icon: Library,
      href: "/library",
      color: "purple" as const,
      badge: dashboardData?.borrowedBooks?.length
        ? `${dashboardData.borrowedBooks.length} borrowed`
        : undefined,
    },
    {
      title: "Raise Ticket",
      description: "Submit support request",
      icon: Ticket,
      href: "/tickets/new",
      color: "rose" as const,
    },
    {
      title: "Events",
      description: "Campus events & activities",
      icon: Event,
      href: "/events",
      color: "teal" as const,
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
            Here&apos;s what&apos;s happening today
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
              Today&apos;s Schedule
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData?.todaySchedule?.length ? (
            <div className="space-y-3">
              {dashboardData.todaySchedule.slice(0, 5).map((slot, index) => (
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
                          ? "text-slate-400 dark:text-slate-500 line-through"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {slot.course?.name || "Unknown Course"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {slot.classroom?.name || "TBA"} • {slot.course?.code}
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
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData?.upcomingEvents?.length ? (
            <div className="space-y-3">
              {dashboardData.upcomingEvents.slice(0, 4).map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center w-12 text-center bg-teal-50 dark:bg-teal-950 rounded-lg p-2">
                    <span className="text-xs text-teal-600 dark:text-teal-400">
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                      {new Date(event.startTime).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {event.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {event.type} • {event.location || "TBA"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Event className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </div>

      {dashboardData?.pendingTickets?.length ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Pending Tickets
            </h2>
            <Link
              href="/tickets"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {dashboardData.pendingTickets.slice(0, 3).map((ticket) => (
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <FeatureCard key={action.href} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
}
