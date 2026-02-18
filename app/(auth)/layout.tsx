import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            College Super-App
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Your all-in-one campus companion
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
