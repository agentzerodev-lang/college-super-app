"use client";

import { Home, Search, Calendar, Ticket, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/timetable", icon: Calendar, label: "Schedule" },
  { href: "/tickets", icon: Ticket, label: "Tickets" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-0 left-0 right-0 md:hidden z-50"
    >
      <div className="mx-4 mb-4">
        <div className="backdrop-blur-2xl bg-dark-900/90 border border-white/10 rounded-2xl shadow-glass-lg">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center flex-1 h-full"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-x-2 top-1 bottom-1 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={cn(
                      "flex flex-col items-center justify-center relative z-10",
                      isActive ? "text-primary-400" : "text-slate-500"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <motion.span
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0.7 }}
                      className="text-xs mt-1 font-medium"
                    >
                      {item.label}
                    </motion.span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
