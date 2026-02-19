"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useRole } from "@/lib/auth";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { HostelAdminDashboard } from "@/components/dashboard/HostelAdminDashboard";
import { CanteenAdminDashboard } from "@/components/dashboard/CanteenAdminDashboard";
import { Loader2, Calendar, Plus, Ticket, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const { isLoaded, role } = useRole();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Auto-create user for hackathon (no onboarding required)
  const getOrCreateHackathonUser = useMutation(api.users.getOrCreateHackathonUser);
  
  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // Auto-create user if not exists (hackathon mode)
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (user && !currentUser && !isCreatingUser) {
        setIsCreatingUser(true);
        try {
          await getOrCreateHackathonUser({
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress ?? "",
            name: user.fullName ?? user.username ?? "Hackathon User",
          });
        } catch (err) {
          console.error("Failed to create hackathon user:", err);
        } finally {
          setIsCreatingUser(false);
        }
      }
    };

    createUserIfNeeded();
  }, [user, currentUser, isCreatingUser, getOrCreateHackathonUser]);

  if (!isLoaded || isCreatingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Show role-specific dashboard if available
  if (role) {
    switch (role) {
      case "student":
        return <StudentDashboard />;
      case "faculty":
        return <FacultyDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "hostelAdmin":
        return <HostelAdminDashboard />;
      case "canteenAdmin":
        return <CanteenAdminDashboard />;
    }
  }

  // Fallback for new users (hackathon mode) - show a simple dashboard
  return (
    <div className="p-6 space-y-6">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
          <Sparkles className="w-8 h-8 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome to MySRKR!
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          You&apos;re all set! You can now access the app features. Complete your profile anytime to unlock more features.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link href="/events" className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-all">
            <Calendar className="w-6 h-6 text-primary-400 mb-2 mx-auto" />
            <h3 className="text-white font-medium">Events</h3>
            <p className="text-sm text-slate-400">Browse & create events</p>
          </Link>
          
          <Link href="/resources" className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-all">
            <Plus className="w-6 h-6 text-primary-400 mb-2 mx-auto" />
            <h3 className="text-white font-medium">Resources</h3>
            <p className="text-sm text-slate-400">Access study materials</p>
          </Link>
          
          <Link href="/tickets" className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-all">
            <Ticket className="w-6 h-6 text-primary-400 mb-2 mx-auto" />
            <h3 className="text-white font-medium">Tickets</h3>
            <p className="text-sm text-slate-400">Raise support tickets</p>
          </Link>
        </div>

        <div className="mt-8">
          <Link 
            href="/onboarding" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
