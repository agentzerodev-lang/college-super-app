"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  FileText, 
  Video, 
  Link, 
  Image, 
  File,
  Download,
  ExternalLink,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

interface ResourceCardProps {
  title: string;
  description?: string;
  type: "document" | "video" | "link" | "image" | "other";
  url: string;
  courseName?: string;
  uploadedByName?: string;
  tags?: string[];
  downloadCount?: number;
  createdAt: number;
  isOwner?: boolean;
  canEdit?: boolean;
  onDownload?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const typeConfig = {
  document: { icon: FileText, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  video: { icon: Video, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  link: { icon: Link, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  image: { icon: Image, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  other: { icon: File, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-900/30" },
};

export function ResourceCard({
  title,
  description,
  type,
  url,
  courseName,
  uploadedByName,
  tags = [],
  downloadCount = 0,
  createdAt,
  isOwner = false,
  canEdit = false,
  onDownload,
  onView,
  onEdit,
  onDelete,
}: ResourceCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const config = typeConfig[type];
  const TypeIcon = config.icon;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    if (onDownload) {
      setIsLoading(true);
      try {
        await onDownload();
      } finally {
        setIsLoading(false);
      }
    } else if (type === "link") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 p-3 rounded-xl ${config.bg}`}>
            <TypeIcon className={`w-6 h-6 ${config.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {title}
                </h3>
                {courseName && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {courseName}
                  </p>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
                      {onView && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onView();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      )}
                      {(isOwner || canEdit) && onEdit && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onEdit();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {(isOwner || canEdit) && onDelete && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onDelete();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
              {uploadedByName && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {uploadedByName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {downloadCount} downloads
              </span>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-slate-400">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleDownload}
            variant="primary"
            size="sm"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              "Loading..."
            ) : type === "link" ? (
              <>
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Link
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
