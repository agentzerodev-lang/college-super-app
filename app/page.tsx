import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function HomePage() {
  const user = await currentUser();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">MySRKR</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Your all-in-one campus companion for attendance, resources, canteen, library, and more.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignInButton mode="redirect" forceRedirectUrl="/onboarding">
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="redirect" forceRedirectUrl="/onboarding">
            <button className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-lg">
              Sign Up
            </button>
          </SignUpButton>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: "📅", label: "Attendance" },
            { icon: "📚", label: "Resources" },
            { icon: "🍔", label: "Canteen" },
            { icon: "🚨", label: "SOS" },
          ].map((feature) => (
            <div key={feature.label} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {feature.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
