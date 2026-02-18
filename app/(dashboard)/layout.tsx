"use client";

import { useCurrentUser, useRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isOnboarded } = useCurrentUser();
  const { role } = useRole();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  if (!role) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
