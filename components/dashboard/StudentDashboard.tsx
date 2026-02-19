"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Ticket,
  PartyPopper,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Library,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "./FeatureCard";
import { QuickStats } from "./QuickStats";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { H2, H3, Text } from "@/components/ui/typography";
import { staggerContainer, staggerItem } from "@/components/motion/variants";
import { cn } from "@/lib/utils";

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
          color: "primary" as const,
        },
        {
          label: "Attendance Today",
          value: `${dashboardData.attendanceStats.present}/${dashboardData.attendanceStats.total}`,
          icon: CheckCircle,
          color: "success" as const,
        },
        {
          label: "Pending Tickets",
          value: dashboardData.pendingTickets.length,
          icon: Ticket,
          color: "warning" as const,
        },
        {
          label: "Wallet Balance",
          value: `₹${dashboardData.walletBalance}`,
          icon: Wallet,
          color: "accent" as const,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Timetable",
      description: "View your schedule",
      icon: Calendar,
      href: "/timetable",
      color: "primary" as const,
    },
    {
      title: "Attendance",
      description: "Check your attendance",
      icon: CheckCircle,
      href: "/attendance",
      color: "success" as const,
    },
    {
      title: "Canteen",
      description: "Order food online",
      icon: Utensils,
      href: "/canteen",
      color: "warning" as const,
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
      title: "Tickets",
      description: "Submit support request",
      icon: Ticket,
      href: "/tickets",
      color: "error" as const,
    },
    {
      title: "Events",
      description: "Campus events & activities",
      icon: PartyPopper,
      href: "/events",
      color: "accent" as const,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-primary-400 font-medium">{getGreeting()}</span>
          </div>
          <H2 animate delay={0.1}>
            {profile.name?.split(" ")[0]}!
          </H2>
          <Text muted className="mt-1">
            Here&apos;s what&apos;s happening today
          </Text>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block text-right"
        >
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-2xl font-bold text-white">
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </motion.div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <QuickStats stats={stats} />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <H3>Today&apos;s Schedule</H3>
            <Link
              href="/timetable"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : dashboardData?.todaySchedule?.length ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {dashboardData.todaySchedule.slice(0, 5).map((slot, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                    slot.isOngoing
                      ? "bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30"
                      : slot.isCompleted
                      ? "bg-dark-700/30 opacity-60"
                      : "bg-dark-700/50 hover:bg-dark-700/70"
                  )}
                >
                  <div className="flex flex-col items-center justify-center w-14 text-center">
                    <Clock
                      className={cn(
                        "w-4 h-4 mb-1",
                        slot.isOngoing
                          ? "text-primary-400"
                          : slot.isCompleted
                          ? "text-slate-500"
                          : "text-slate-400"
                      )}
                    />
                    <span className="text-xs text-slate-400">
                      {formatTime(slot.startTime)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium truncate",
                        slot.isCompleted
                          ? "text-slate-500 line-through"
                          : "text-white"
                      )}
                    >
                      {slot.course?.name || "Unknown Course"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {slot.classroom?.name || "TBA"} • {slot.course?.code}
                    </p>
                  </div>
                  {slot.isOngoing && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full"
                    >
                      Ongoing
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No classes scheduled for today</p>
            </div>
          )}
        </GlassCard>

        <GlassCard variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <H3>Upcoming Events</H3>
            <Link
              href="/events"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : dashboardData?.upcomingEvents?.length ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {dashboardData.upcomingEvents.slice(0, 4).map((event) => (
                <motion.div
                  key={event._id}
                  variants={staggerItem}
                  whileHover={{ x: 4 }}
                >
                  <Link
                    href={`/events/${event._id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700/70 transition-all duration-200"
                  >
                    <div className="flex flex-col items-center justify-center w-14 text-center bg-gradient-to-br from-accent-500/20 to-accent-500/5 rounded-xl p-2 border border-accent-500/20">
                      <span className="text-xs text-accent-400 font-medium">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-lg font-bold text-accent-400">
                        {new Date(event.startTime).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-400 capitalize">
                        {event.type} • {event.location || "TBA"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <PartyPopper className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming events</p>
            </div>
          )}
        </GlassCard>
      </div>

      {dashboardData?.pendingTickets?.length ? (
        <GlassCard variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              <H3>Pending Tickets</H3>
            </div>
            <Link
              href="/tickets"
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {dashboardData.pendingTickets.slice(0, 3).map((ticket) => (
              <motion.div key={ticket._id} variants={staggerItem}>
                <Link
                  href={`/tickets/${ticket._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700/70 transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-white">{ticket.title}</p>
                    <p className="text-sm text-slate-400 capitalize">
                      {ticket.category} • {ticket.priority} priority
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-full capitalize",
                      ticket.status === "open"
                        ? "bg-warning-500/20 text-warning-500"
                        : "bg-primary-500/20 text-primary-400"
                    )}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </GlassCard>
      ) : null}

      <div>
        <H3 className="mb-4">Quick Actions</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FeatureCard {...action} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
