"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  AlertCircle,
  Building,
  GraduationCap,
  Home,
  HelpCircle,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw
} from "lucide-react";

interface TicketCardProps {
  title: string;
  description: string;
  category: "technical" | "academic" | "facility" | "hostel" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdBy?: {
    name: string;
    role?: string;
  };
  assignedTo?: {
    name: string;
  } | null;
  createdAt: number;
  resolvedAt?: number;
  canUpdate?: boolean;
  canAssign?: boolean;
  onViewDetails?: () => void;
  onUpdateStatus?: (status: "open" | "in_progress" | "resolved" | "closed") => void;
  onAssign?: () => void;
}

const categoryConfig = {
  technical: { icon: AlertCircle, label: "Technical", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  academic: { icon: GraduationCap, label: "Academic", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  facility: { icon: Building, label: "Facility", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  hostel: { icon: Home, label: "Hostel", color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/30" },
  other: { icon: HelpCircle, label: "Other", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-900/30" },
};

const priorityConfig = {
  low: { label: "Low", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-700", border: "border-slate-200 dark:border-slate-600" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-700" },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-700" },
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-700" },
};

const statusConfig = {
  open: { label: "Open", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  in_progress: { label: "In Progress", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  closed: { label: "Closed", icon: XCircle, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-700" },
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function TicketCard({
  title,
  description,
  category,
  priority,
  status,
  createdBy,
  assignedTo,
  createdAt,
  resolvedAt,
  canUpdate = false,
  canAssign = false,
  onViewDetails,
  onUpdateStatus,
  onAssign,
}: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const categoryInfo = categoryConfig[category];
  const priorityInfo = priorityConfig[priority];
  const statusInfo = statusConfig[status];
  const CategoryIcon = categoryInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={`overflow-hidden border-l-4 ${priorityInfo.border}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 p-2 rounded-lg ${categoryInfo.bg}`}>
            <CategoryIcon className={`w-5 h-5 ${categoryInfo.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryInfo.bg} ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityInfo.bg} ${priorityInfo.color}`}>
                    {priorityInfo.label}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.color}`}
                >
                  <StatusIcon className={`w-3 h-3 ${status === "in_progress" ? "animate-spin" : ""}`} />
                  {statusInfo.label}
                </button>

                {showStatusMenu && canUpdate && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
                      {Object.entries(statusConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setShowStatusMenu(false);
                              onUpdateStatus?.(key as typeof status);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                              status === key ? config.color : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${key === "in_progress" ? "animate-spin" : ""}`} />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-left"
            >
              <p className={`text-sm text-slate-500 dark:text-slate-400 mt-2 ${
                isExpanded ? "" : "line-clamp-2"
              }`}>
                {description}
              </p>
            </button>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(createdAt)}
              </span>
              {createdBy && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {createdBy.name}
                </span>
              )}
              {assignedTo && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Assigned to {assignedTo.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {canAssign && !assignedTo && onAssign && (
            <Button
              onClick={onAssign}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              Assign
            </Button>
          )}
          {status === "resolved" && canUpdate && onUpdateStatus && (
            <Button
              onClick={() => onUpdateStatus("open")}
              variant="secondary"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reopen
            </Button>
          )}
        </div>

        {resolvedAt && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Resolved {formatRelativeTime(resolvedAt)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
