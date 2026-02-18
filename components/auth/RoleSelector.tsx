"use client";

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
}

const ROLES = [
  {
    id: "student",
    label: "Student",
    description: "Access classes, attendance, and campus services",
    icon: "🎓",
  },
  {
    id: "faculty",
    label: "Faculty",
    description: "Manage classes, attendance, and student records",
    icon: "👨‍🏫",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Full system access and management",
    icon: "🔧",
  },
  {
    id: "hostelAdmin",
    label: "Hostel Admin",
    description: "Manage hostel operations and meals",
    icon: "🏠",
  },
  {
    id: "canteenAdmin",
    label: "Canteen Admin",
    description: "Manage canteen menu and orders",
    icon: "🍽️",
  },
] as const;

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      {ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onChange(role.id)}
          className={`w-full p-4 rounded-xl text-left transition-all ${
            value === role.id
              ? "bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500 dark:border-primary-400"
              : "bg-white dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{role.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {role.label}
                </span>
                {value === role.id && (
                  <span className="text-primary-600 dark:text-primary-400">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {role.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
