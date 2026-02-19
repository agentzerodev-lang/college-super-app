"use client";

import { Card } from "@/components/ui/Card";
import { 
  Trophy, 
  Medal, 
  Crown,
  Eye,
  EyeOff
} from "lucide-react";

interface LeaderboardRowProps {
  rank: number;
  userId: string;
  displayName: string;
  isAnonymous?: boolean;
  score: number;
  totalScore?: number;
  skillName?: string;
  skillCount?: number;
  topSkills?: Array<{ skillName: string; score: number }>;
  badges?: string[];
  isCurrentUser?: boolean;
  verifiedAt?: number;
  onToggleGhostMode?: () => void;
  onViewProfile?: () => void;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{rank}</span>;
  }
}

function getRankBg(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800";
    case 2:
      return "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-300 dark:border-slate-600";
    case 3:
      return "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800";
    default:
      return "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  }
}

export function LeaderboardRow({
  rank,
  userId: _userId,
  displayName,
  isAnonymous = false,
  score,
  totalScore,
  skillName,
  skillCount,
  topSkills = [],
  badges = [],
  isCurrentUser = false,
  verifiedAt,
  onToggleGhostMode,
  onViewProfile: _onViewProfile,
}: LeaderboardRowProps) {
  const displayScore = totalScore ?? score;

  return (
    <Card className={`${getRankBg(rank)} ${isCurrentUser ? "ring-2 ring-indigo-500" : ""}`}>
      <div className="flex items-center gap-3 p-3 md:p-4">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          {getRankIcon(rank)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {displayName}
            </span>
            {isAnonymous && (
              <EyeOff className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
            {isCurrentUser && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                You
              </span>
            )}
          </div>

          {skillName && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {skillName}
            </p>
          )}

          {skillCount !== undefined && skillCount > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {skillCount} skill{skillCount !== 1 ? "s" : ""}
            </p>
          )}

          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {topSkills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  {skill.skillName}: {skill.score}
                </span>
              ))}
            </div>
          )}

          {badges.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {badges.slice(0, 3).map((badge, index) => (
                <span
                  key={index}
                  className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                >
                  {badge}
                </span>
              ))}
              {badges.length > 3 && (
                <span className="text-xs text-slate-400">
                  +{badges.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {displayScore.toLocaleString()}
            </span>
          </div>
          {verifiedAt && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {new Date(verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {isCurrentUser && onToggleGhostMode && (
          <button
            onClick={onToggleGhostMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
            title={isAnonymous ? "Show on leaderboard" : "Hide from leaderboard"}
          >
            {isAnonymous ? (
              <Eye className="w-4 h-4 text-slate-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}
      </div>
    </Card>
  );
}
