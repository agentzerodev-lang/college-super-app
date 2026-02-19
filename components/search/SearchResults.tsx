"use client";

import { 
  Calendar, 
  FileText, 
  Book, 
  Ticket,
  Clock,
  MapPin,
  Download,
  User,
  AlertCircle
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "event" | "resource" | "book" | "ticket";
  title: string;
  description?: string;
  subtitle?: string;
  metadata?: Record<string, unknown>;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

const typeConfig = {
  event: {
    icon: Calendar,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    label: "Event",
  },
  resource: {
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Resource",
  },
  book: {
    icon: Book,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Book",
  },
  ticket: {
    icon: Ticket,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "Ticket",
  },
};

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-green-600 dark:text-green-400";
      case "in_progress":
        return "text-yellow-600 dark:text-yellow-400";
      case "resolved":
      case "closed":
        return "text-slate-500 dark:text-slate-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {results.map((result) => {
        const config = typeConfig[result.type];
        const Icon = config.icon;

        return (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => onResultClick(result)}
            className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {result.title}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
              </div>

              {result.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {result.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                {result.type === "event" && typeof result.metadata?.startTime === "number" && (
                  <>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(result.metadata.startTime)}
                    </span>
                    {result.subtitle && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {result.subtitle}
                      </span>
                    )}
                  </>
                )}

                {result.type === "resource" && (
                  <>
                    <span className="capitalize">{result.subtitle}</span>
                    {typeof result.metadata?.downloadCount === "number" && (
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {result.metadata.downloadCount} downloads
                      </span>
                    )}
                  </>
                )}

                {result.type === "book" && (
                  <>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {result.subtitle}
                    </span>
                    {typeof result.metadata?.availableCopies === "number" && typeof result.metadata?.totalCopies === "number" && (
                      <span>
                        {result.metadata.availableCopies} / {result.metadata.totalCopies} available
                      </span>
                    )}
                  </>
                )}

                {result.type === "ticket" && (
                  <>
                    <span className="capitalize">{result.subtitle}</span>
                    {typeof result.metadata?.status === "string" && (
                      <span className={`capitalize flex items-center gap-1 ${getStatusColor(result.metadata.status)}`}>
                        <AlertCircle className="w-3 h-3" />
                        {result.metadata.status.replace("_", " ")}
                      </span>
                    )}
                    {typeof result.metadata?.priority === "string" && (
                      <span className={`capitalize ${getPriorityColor(result.metadata.priority)}`}>
                        {result.metadata.priority}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
