"use client";

import { useCurrentUser, useRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-6 lg:p-8 pb-16 md:pb-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
