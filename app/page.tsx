import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { 
  GraduationCap, 
  CalendarCheck, 
  BookOpen, 
  Utensils, 
  ShieldAlert, 
  Library, 
  Clock,
  ChevronRight,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Attendance",
    description: "Track your attendance with real-time insights and alerts",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  {
    icon: BookOpen,
    title: "Resources",
    description: "Access study materials, notes, and course content",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400"
  },
  {
    icon: Utensils,
    title: "Canteen",
    description: "Browse menus, order food, and manage your meal plans",
    color: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400"
  },
  {
    icon: Library,
    title: "Library",
    description: "Reserve books, track due dates, and manage loans",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400"
  },
  {
    icon: Clock,
    title: "Timetable",
    description: "View your class schedule and get timely reminders",
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400"
  },
  {
    icon: ShieldAlert,
    title: "Emergency SOS",
    description: "Quick access to emergency contacts and services",
    color: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-400"
  }
];

export default async function HomePage() {
  const user = await currentUser();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dark-950 bg-gradient-mesh" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[128px]" />
      
      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MySRKR</span>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton mode="redirect" forceRedirectUrl="/onboarding">
              <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect" forceRedirectUrl="/onboarding">
              <button className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-slate-300">Your Complete Campus Companion</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
              Everything you need for
              <span className="block text-gradient-animated">campus life</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Streamline your college experience with attendance tracking, resource access, 
              canteen ordering, library management, and more — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <SignUpButton mode="redirect" forceRedirectUrl="/onboarding">
                <button className="group px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-glow-lg flex items-center gap-2">
                  Get Started Free
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <SignInButton mode="redirect" forceRedirectUrl="/onboarding">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm">
                  Sign In to Account
                </button>
              </SignInButton>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
              {[
                { value: "10K+", label: "Students" },
                { value: "50+", label: "Features" },
                { value: "99%", label: "Uptime" }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              All-in-one platform
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Access everything you need for a seamless campus experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-500 text-sm">
              © 2025 MySRKR. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
