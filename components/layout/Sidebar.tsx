"use client";

import { 
  Home, Search, Bell, User, LogOut, Moon, Sun,
  Calendar, BookOpen, AlertTriangle, UtensilsCrossed,
  Building2, Trophy, Wallet, Library, CalendarClock
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";

const mainNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/profile", icon: User, label: "Profile" },
];

const featureNavItems = [
  { href: "/attendance", icon: Calendar, label: "Attendance" },
  { href: "/timetable", icon: CalendarClock, label: "Timetable" },
  { href: "/classrooms", icon: Building2, label: "Free Rooms" },
  { href: "/resources", icon: BookOpen, label: "Resources" },
  { href: "/tickets", icon: AlertTriangle, label: "Tickets" },
  { href: "/sos", icon: AlertTriangle, label: "SOS" },
  { href: "/hostel", icon: Building2, label: "Hostel" },
  { href: "/canteen", icon: UtensilsCrossed, label: "Canteen" },
  { href: "/playground", icon: Trophy, label: "Playground" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 fixed left-0 top-0 z-40">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">MySRKR</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="px-3 mb-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3">
            Main
          </span>
        </div>
        <ul className="space-y-1 px-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-3 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3">
            Features
          </span>
        </div>
        <ul className="space-y-1 px-3">
          {featureNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
