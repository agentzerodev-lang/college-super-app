"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Tag,
  ExternalLink
} from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  type: "academic" | "cultural" | "sports" | "workshop" | "seminar" | "competition" | "other";
  startTime: number;
  endTime: number;
  location?: string;
  imageUrl?: string;
  tags?: string[];
  maxAttendees?: number;
  registrationCount?: number;
  isRegistered?: boolean;
  isPublic?: boolean;
  creatorName?: string;
  fee?: number;
  onRegister?: () => void;
  onViewDetails?: () => void;
  onCancelRegistration?: () => void;
}

const typeColors = {
  academic: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  cultural: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  sports: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  workshop: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  seminar: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  competition: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  other: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
};

export function EventCard({
  id,
  title,
  description,
  type,
  startTime,
  endTime,
  location,
  imageUrl,
  tags = [],
  maxAttendees,
  registrationCount = 0,
  isRegistered = false,
  isPublic = true,
  creatorName,
  fee,
  onRegister,
  onViewDetails,
  onCancelRegistration,
}: EventCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isUpcoming = startTime > Date.now();
  const spotsRemaining = maxAttendees ? maxAttendees - registrationCount : null;
  const isFull = maxAttendees !== undefined && spotsRemaining !== null && spotsRemaining <= 0;

  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <div className="h-32 md:h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${typeColors[type]}`}>
            {type}
          </span>
          {isRegistered && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              Registered
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {description}
          </p>
        )}

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(startTime)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {maxAttendees !== undefined && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4" />
              <span>
                {registrationCount} / {maxAttendees} registered
                {spotsRemaining !== null && spotsRemaining > 0 && (
                  <span className="text-green-500 dark:text-green-400 ml-1">
                    ({spotsRemaining} spots left)
                  </span>
                )}
              </span>
            </div>
          )}

          {fee !== undefined && fee > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              <span>Fee:</span>
              <span>₹{fee}</span>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {creatorName && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            by {creatorName}
          </p>
        )}

        <div className="flex gap-2">
          {isUpcoming && !isRegistered && !isFull && onRegister && (
            <Button onClick={onRegister} variant="primary" size="sm" className="flex-1">
              Register
            </Button>
          )}
          
          {isRegistered && onCancelRegistration && (
            <Button onClick={onCancelRegistration} variant="danger" size="sm" className="flex-1">
              Cancel Registration
            </Button>
          )}

          {isFull && !isRegistered && (
            <span className="text-sm text-red-500 font-medium">Event Full</span>
          )}

          {onViewDetails && (
            <Button onClick={onViewDetails} variant="secondary" size="sm" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-1" />
              Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
