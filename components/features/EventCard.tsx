"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button-new";
import { cn } from "@/lib/utils";
import { spring } from "@/components/motion/variants";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Tag,
  ExternalLink
} from "lucide-react";

interface EventCardProps {
  id?: string;
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

const typeVariants = {
  academic: { gradient: "from-blue-500 to-blue-600", bg: "bg-blue-500/10", text: "text-blue-400" },
  cultural: { gradient: "from-purple-500 to-purple-600", bg: "bg-purple-500/10", text: "text-purple-400" },
  sports: { gradient: "from-green-500 to-green-600", bg: "bg-green-500/10", text: "text-green-400" },
  workshop: { gradient: "from-orange-500 to-orange-600", bg: "bg-orange-500/10", text: "text-orange-400" },
  seminar: { gradient: "from-teal-500 to-teal-600", bg: "bg-teal-500/10", text: "text-teal-400" },
  competition: { gradient: "from-red-500 to-red-600", bg: "bg-red-500/10", text: "text-red-400" },
  other: { gradient: "from-slate-500 to-slate-600", bg: "bg-slate-500/10", text: "text-slate-400" },
};

export function EventCard({
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
  const variants = typeVariants[type];

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -4 }}
      transition={spring}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "backdrop-blur-xl bg-dark-800/50",
        "border border-white/5",
        "transition-all duration-300",
        "hover:border-white/10 hover:bg-dark-800/70",
        "shadow-glass hover:shadow-glass-lg"
      )}
    >
      {imageUrl && (
        <div className="h-36 w-full overflow-hidden relative">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={cn(
              "text-xs px-3 py-1 rounded-full font-semibold capitalize",
              "bg-gradient-to-r",
              variants.gradient,
              "text-white"
            )}
          >
            {type}
          </motion.span>
          {isRegistered && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs px-3 py-1 rounded-full bg-success-500/20 text-success-500 font-semibold"
            >
              Registered
            </motion.span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span>{formatDate(startTime)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4 text-accent-400" />
            <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="w-4 h-4 text-warning-500" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {maxAttendees !== undefined && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="w-4 h-4 text-success-500" />
              <span>
                {registrationCount} / {maxAttendees} registered
                {spotsRemaining !== null && spotsRemaining > 0 && (
                  <span className="text-success-500 ml-1">
                    ({spotsRemaining} spots left)
                  </span>
                )}
              </span>
            </div>
          )}

          {fee !== undefined && fee > 0 && (
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-slate-500">Fee:</span>
              <span className="text-accent-400">₹{fee}</span>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 text-xs text-slate-500 px-2 py-1 rounded-lg bg-dark-700/50"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-slate-600 px-2 py-1">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {creatorName && (
          <p className="text-xs text-slate-500 mb-4">
            by <span className="text-slate-400">{creatorName}</span>
          </p>
        )}

        <div className="flex gap-2">
          {isUpcoming && !isRegistered && !isFull && onRegister && (
            <Button onClick={onRegister} variant="primary" size="sm" className="flex-1" glow>
              Register
            </Button>
          )}
          
          {isRegistered && onCancelRegistration && (
            <Button onClick={onCancelRegistration} variant="danger" size="sm" className="flex-1">
              Cancel Registration
            </Button>
          )}

          {isFull && !isRegistered && (
            <span className="text-sm text-error-500 font-semibold">Event Full</span>
          )}

          {onViewDetails && (
            <Button onClick={onViewDetails} variant="glass" size="sm" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-1" />
              Details
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
