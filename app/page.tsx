import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">College Super-App</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Your all-in-one campus companion for scheduling, chatting, ride-sharing, and more.
          </p>
        </div>

        <SignedOut>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <button className="btn-primary text-lg px-8 py-3">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-secondary text-lg px-8 py-3">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <Link href="/home" className="btn-primary text-lg px-8 py-3 inline-block">
            Go to Dashboard
          </Link>
        </SignedIn>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: "📅", label: "Calendar" },
            { icon: "✅", label: "Tasks" },
            { icon: "💬", label: "Chat" },
            { icon: "🚗", label: "Rides" },
          ].map((feature) => (
            <div key={feature.label} className="card p-4">
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
