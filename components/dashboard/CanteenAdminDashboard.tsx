"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Store,
  ShoppingBag,
  IndianRupee,
  Clock,
  ChefHat,
  ChevronRight,
  Package,
} from "lucide-react";
import Link from "next/link";
import { QuickStats } from "./QuickStats";
import { FeatureCard } from "./FeatureCard";

export function CanteenAdminDashboard() {
  const { profile } = useCurrentUser();
  const collegeId = profile?.collegeId as Id<"colleges"> | undefined;

  const dashboardData = useQuery(
    api.dashboard.getCanteenAdminDashboard,
    profile?.clerkUserId && collegeId
      ? { clerkUserId: profile.clerkUserId, collegeId }
      : "skip"
  );

  if (!profile) return null;

  const isLoading = dashboardData === undefined;

  const stats = dashboardData
    ? [
        {
          label: "Today's Orders",
          value: dashboardData.orders.today,
          icon: ShoppingBag,
          color: "primary" as const,
        },
        {
          label: "Pending Orders",
          value: dashboardData.orders.pending + dashboardData.orders.confirmed + dashboardData.orders.preparing,
          icon: Clock,
          color: "warning" as const,
        },
        {
          label: "Today's Revenue",
          value: `₹${dashboardData.orders.todayRevenue}`,
          icon: IndianRupee,
          color: "success" as const,
        },
        {
          label: "Menu Items",
          value: dashboardData.items.total,
          icon: Package,
          color: "accent" as const,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Manage Menu",
      description: "Add or edit items",
      icon: Package,
      href: "/canteen-admin/menu",
      color: "primary" as const,
    },
    {
      title: "Orders",
      description: "View and manage orders",
      icon: ShoppingBag,
      href: "/canteen-admin/orders",
      color: "accent" as const,
      badge: dashboardData?.orders?.pending
        ? `${dashboardData.orders.pending} pending`
        : undefined,
    },
    {
      title: "Canteens",
      description: "Manage canteens",
      icon: Store,
      href: "/canteen-admin/canteens",
      color: "warning" as const,
    },
    {
      title: "Analytics",
      description: "Sales & reports",
      icon: IndianRupee,
      href: "/canteen-admin/analytics",
      color: "success" as const,
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
    confirmed: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    preparing: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    ready: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Canteen Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage canteen operations
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
              Active Orders
            </h2>
            <Link
              href="/canteen-admin/orders"
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
          ) : dashboardData?.orders?.recentActiveOrders?.length ? (
            <div className="space-y-3">
              {dashboardData.orders.recentActiveOrders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  href={`/canteen-admin/orders/${order._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950">
                      <ChefHat className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {order.userName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.items.length} items • ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[order.status] || "bg-slate-100 dark:bg-slate-700"}`}
                  >
                    {order.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active orders</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Order Statistics
            </h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse h-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Pending", value: dashboardData?.orders?.pending || 0, color: "bg-amber-500" },
                  { label: "Confirmed", value: dashboardData?.orders?.confirmed || 0, color: "bg-blue-500" },
                  { label: "Preparing", value: dashboardData?.orders?.preparing || 0, color: "bg-purple-500" },
                  { label: "Ready", value: dashboardData?.orders?.ready || 0, color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Total Revenue</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ₹{dashboardData?.orders?.totalRevenue || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-500 dark:text-slate-400">Delivered Orders</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {dashboardData?.orders?.delivered || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Menu Overview
          </h2>
          <Link
            href="/canteen-admin/menu"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="animate-pulse h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Breakfast", value: dashboardData?.items?.byCategory?.breakfast || 0 },
              { label: "Main Course", value: dashboardData?.items?.byCategory?.main_course || 0 },
              { label: "Snacks", value: dashboardData?.items?.byCategory?.snacks || 0 },
              { label: "Beverages", value: dashboardData?.items?.byCategory?.beverages || 0 },
              { label: "Desserts", value: dashboardData?.items?.byCategory?.desserts || 0 },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
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
