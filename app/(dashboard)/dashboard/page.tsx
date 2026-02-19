"use client";

import { useRole } from "@/lib/auth";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { HostelAdminDashboard } from "@/components/dashboard/HostelAdminDashboard";
import { CanteenAdminDashboard } from "@/components/dashboard/CanteenAdminDashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { isLoaded, role } = useRole();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
    default:
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-500 dark:text-slate-400">
            Unable to determine your role. Please contact support.
          </p>
        </div>
      );
  }
}
