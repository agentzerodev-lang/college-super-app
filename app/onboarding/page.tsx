"use client";

export const dynamic = "force-dynamic";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RoleSelector from "@/components/auth/RoleSelector";

const BRANCHES = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Biotechnology",
  "Information Technology",
];

const YEARS = [1, 2, 3, 4];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const existingUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const [role, setRole] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [year, setYear] = useState<number>(1);
  const [phone, setPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Only redirect if onboarding is fully complete (both DB role and Clerk metadata)
    if (existingUser?.role && user?.unsafeMetadata?.onboardingComplete === true) {
      router.push("/dashboard");
    }
  }, [existingUser, user, router]);

  useEffect(() => {
    if (user?.unsafeMetadata?.role) {
      setRole(user.unsafeMetadata.role as string);
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role");
      return;
    }

    if (role === "student" && (!branch || !year)) {
      setError("Please select your branch and year");
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrUpdateUser({
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? user.username ?? "",
        role: role as "student" | "faculty" | "admin" | "hostelAdmin" | "canteenAdmin",
        branch: role === "student" ? branch : undefined,
        year: role === "student" ? year : undefined,
        phone: phone || undefined,
      });

      await user.update({
        unsafeMetadata: { role, onboardingComplete: true },
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Tell us a bit about yourself
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              I am a
            </label>
            <RoleSelector value={role} onChange={setRole} />
          </div>

          {role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select your branch</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Year
                </label>
                <div className="flex gap-2">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        year === y
                          ? "bg-indigo-600 text-white"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Year {y}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Completing..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
