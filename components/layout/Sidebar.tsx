"use client";

import { 
  Home, Search, User, LogOut, Moon, Sun,
  Calendar, BookOpen, AlertTriangle, UtensilsCrossed,
  Building2, Trophy, Wallet, Library, CalendarClock, Settings, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { spring } from "@/components/motion/variants";

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
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 z-40",
        "backdrop-blur-2xl backdrop-saturate-150",
        "bg-dark-900/80 border-r border-white/5",
        "transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="p-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow"
          >
            <span className="text-white font-bold text-lg">S</span>
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"
              >
                MySRKR
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="px-3 mb-2">
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3"
              >
                Main
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <ul className="space-y-1 px-3">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl"
                      transition={spring}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10", active && "text-primary-400")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <div className="px-3 mt-6 mb-2">
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3"
              >
                Features
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <ul className="space-y-1 px-3">
          {featureNavItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 3) * 0.03 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5 relative z-10", active && "text-primary-400")} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium relative z-10 text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut()}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-error-500 hover:bg-error-500/10 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-600 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
