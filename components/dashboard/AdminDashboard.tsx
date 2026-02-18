"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Users,
  Ticket,
  Event,
  AlertTriangle,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { QuickStats } from "./QuickStats";
import { FeatureCard } from "./FeatureCard";

export function AdminDashboard() {
  const { profile } = useCurrentUser();
  const collegeId = profile?.collegeId as Id<"colleges"> | undefined;

  const dashboardData = useQuery(
    api.dashboard.getAdminDashboard,
    profile?.clerkUserId && collegeId
      ? { clerkUserId: profile.clerkUserId, collegeId }
      : "skip"
  );

  if (!profile) return null;

  const isLoading = dashboardData === undefined;

  const stats = dashboardData
    ? [
        {
          label: "Total Users",
          value: dashboardData.users.total,
          icon: Users,
          color: "indigo" as const,
          trend: dashboardData.users.active !== dashboardData.users.total
            ? {
                value: Math.round(
                  (dashboardData.users.active / dashboardData.users.total) * 100
                ),
                isPositive: true,
              }
            : undefined,
        },
        {
          label: "Active Users",
          value: dashboardData.users.active,
          icon: Activity,
          color: "emerald" as const,
        },
        {
          label: "Open Tickets",
          value: dashboardData.tickets.open + dashboardData.tickets.inProgress,
          icon: Ticket,
          color: "amber" as const,
        },
        {
          label: "Active Alerts",
          value: dashboardData.sosAlerts.active + dashboardData.sosAlerts.responding,
          icon: AlertTriangle,
          color: "rose" as const,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage all users",
      icon: Users,
      href: "/admin/users",
      color: "indigo" as const,
    },
    {
      title: "Tickets",
      description: "Handle support tickets",
      icon: Ticket,
      href: "/admin/tickets",
      color: "amber" as const,
      badge: dashboardData?.tickets?.open
        ? `${dashboardData.tickets.open} open`
        : undefined,
    },
    {
      title: "Events",
      description: "Manage campus events",
      icon: Event,
      href: "/admin/events",
      color: "teal" as const,
    },
    {
      title: "SOS Alerts",
      description: "Emergency management",
      icon: Shield,
      href: "/admin/sos",
      color: "rose" as const,
      badge:
        dashboardData?.sosAlerts?.active || dashboardData?.sosAlerts?.responding
          ? `${dashboardData.sosAlerts.active + dashboardData.sosAlerts.responding} active`
          : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of campus activities
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

      {dashboardData?.sosAlerts?.activeAlerts?.length ? (
        <div className="card border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              Active SOS Alerts
            </h2>
            <Link
              href="/admin/sos"
              className="text-sm text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {dashboardData.sosAlerts.activeAlerts.slice(0, 3).map((alert) => (
              <Link
                key={alert._id}
                href={`/admin/sos/${alert._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {alert.userName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {alert.type} • {alert.userEmail}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    alert.status === "active"
                      ? "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300"
                      : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {alert.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              User Distribution
            </h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse h-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: "Students",
                  value: dashboardData?.users?.students || 0,
                  color: "bg-indigo-500",
                  textColor: "text-indigo-600 dark:text-indigo-400",
                },
                {
                  label: "Faculty",
                  value: dashboardData?.users?.faculty || 0,
                  color: "bg-teal-500",
                  textColor: "text-teal-600 dark:text-teal-400",
                },
                {
                  label: "Hostel Admins",
                  value: dashboardData?.users?.hostelAdmins || 0,
                  color: "bg-amber-500",
                  textColor: "text-amber-600 dark:text-amber-400",
                },
                {
                  label: "Canteen Admins",
                  value: dashboardData?.users?.canteenAdmins || 0,
                  color: "bg-rose-500",
                  textColor: "text-rose-600 dark:text-rose-400",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                  <span className={`font-semibold ${item.textColor}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Ticket Overview
            </h2>
            <Link
              href="/admin/tickets"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="animate-pulse h-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: "Open",
                  value: dashboardData?.tickets?.open || 0,
                  color: "bg-amber-500",
                },
                {
                  label: "In Progress",
                  value: dashboardData?.tickets?.inProgress || 0,
                  color: "bg-blue-500",
                },
                {
                  label: "Resolved",
                  value: dashboardData?.tickets?.resolved || 0,
                  color: "bg-emerald-500",
                },
                {
                  label: "Closed",
                  value: dashboardData?.tickets?.closed || 0,
                  color: "bg-slate-400",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.value}
                  </span>
                </div>
              ))}
              {(dashboardData?.tickets?.todayCreated || 0) > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {dashboardData?.tickets?.todayCreated}
                    </span>{" "}
                    tickets created today
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
