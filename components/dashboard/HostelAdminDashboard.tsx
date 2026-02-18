"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Home,
  Utensils,
  Star,
  Ticket,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { QuickStats } from "./QuickStats";
import { FeatureCard } from "./FeatureCard";

export function HostelAdminDashboard() {
  const { profile } = useCurrentUser();
  const collegeId = profile?.collegeId as Id<"colleges"> | undefined;

  const dashboardData = useQuery(
    api.dashboard.getHostelAdminDashboard,
    profile?.clerkUserId && collegeId
      ? { clerkUserId: profile.clerkUserId, collegeId }
      : "skip"
  );

  if (!profile) return null;

  const isLoading = dashboardData === undefined;

  const stats = dashboardData
    ? [
        {
          label: "Hostels",
          value: dashboardData.hostels.length,
          icon: Home,
          color: "indigo" as const,
        },
        {
          label: "Today's Meals",
          value: dashboardData.todayMeals.length,
          icon: Utensils,
          color: "teal" as const,
        },
        {
          label: "Avg Rating",
          value: dashboardData.reviews.averageRating || "N/A",
          icon: Star,
          color: "amber" as const,
        },
        {
          label: "Open Tickets",
          value: dashboardData.hostelTickets.open + dashboardData.hostelTickets.inProgress,
          icon: Ticket,
          color: "rose" as const,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Manage Hostels",
      description: "View and edit hostels",
      icon: Home,
      href: "/hostel-admin/hostels",
      color: "indigo" as const,
    },
    {
      title: "Meal Menu",
      description: "Update daily meals",
      icon: Utensils,
      href: "/hostel-admin/meals",
      color: "teal" as const,
    },
    {
      title: "Reviews",
      description: "View student reviews",
      icon: Star,
      href: "/hostel-admin/reviews",
      color: "amber" as const,
    },
    {
      title: "Tickets",
      description: "Handle hostel tickets",
      icon: Ticket,
      href: "/hostel-admin/tickets",
      color: "rose" as const,
      badge: dashboardData?.hostelTickets?.open
        ? `${dashboardData.hostelTickets.open} open`
        : undefined,
    },
  ];

  const mealTypeLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Hostel Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage hostel facilities and services
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
              Today&apos;s Meals
            </h2>
            <Link
              href="/hostel-admin/meals"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Manage <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              ))}
            </div>
          ) : dashboardData?.todayMeals?.length ? (
            <div className="space-y-3">
              {dashboardData.todayMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950">
                    <Utensils className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {mealTypeLabels[meal.mealType] || meal.mealType}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {meal.menu.slice(0, 3).join(", ")}
                      {meal.menu.length > 3 && ` +${meal.menu.length - 3} more`}
                    </p>
                  </div>
                  {meal.hostel && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {meal.hostel.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No meals scheduled for today</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Recent Reviews
            </h2>
            <Link
              href="/hostel-admin/reviews"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              ))}
            </div>
          ) : dashboardData?.reviews?.recentReviews?.length ? (
            <div className="space-y-3">
              {dashboardData.reviews.recentReviews.slice(0, 4).map((review) => (
                <div
                  key={review._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {review.rating}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100 truncate">
                      {review.comment || "No comment"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      by {review.userName} • {review.hostelName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No reviews yet</p>
            </div>
          )}
        </div>
      </div>

      {dashboardData?.hostelTickets?.recent?.length ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Recent Hostel Tickets
            </h2>
            <Link
              href="/hostel-admin/tickets"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {dashboardData.hostelTickets.recent.slice(0, 4).map((ticket) => (
              <Link
                key={ticket._id}
                href={`/hostel-admin/tickets/${ticket._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {ticket.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {ticket.priority} priority
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
