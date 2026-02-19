"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { SignOutButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Shield,
  Wallet,
  Edit,
  LogOut,
  CheckCircle
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  faculty: "Faculty",
  admin: "Administrator",
  hostelAdmin: "Hostel Administrator",
  canteenAdmin: "Canteen Administrator",
};

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const wallet = useQuery(
    api.wallet.getWallet,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  if (!user || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Edit Profile
          </h1>
        </div>
        <ProfileForm
          profile={{
            name: currentUser.name,
            email: currentUser.email,
            branch: currentUser.branch,
            year: currentUser.year,
            phone: currentUser.phone,
          }}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your account settings
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsEditing(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={currentUser.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <User className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {currentUser.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </span>
              {currentUser.status === "active" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {currentUser.phone || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Branch</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {currentUser.branch || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Year</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {currentUser.year ? `Year ${currentUser.year}` : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Wallet Balance
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Available funds
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              ₹{wallet?.balance?.toFixed(2) || "0.00"}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Account Actions
            </h3>
            <div className="space-y-3">
              <SignOutButton>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
