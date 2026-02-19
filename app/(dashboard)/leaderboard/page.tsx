"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeaderboardRow } from "@/components/features/LeaderboardRow";
import { 
  Trophy,
  Medal,
  Crown,
  Search,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  Target,
  Loader2
} from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useUser();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"overall" | "skill">("overall");

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const overallLeaderboard = useQuery(
    api.skills.getOverallLeaderboard,
    currentUser?.collegeId
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId, limit: 50 }
      : "skip"
  );

  const skillLeaderboard = useQuery(
    api.skills.getLeaderboard,
    selectedSkill && currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          skillName: selectedSkill,
          collegeId: currentUser.collegeId,
          limit: 50,
        }
      : "skip"
  );

  const userRanking = useQuery(
    api.skills.getUserRanking,
    { clerkUserId: user?.id || "", skillName: selectedSkill || undefined }
  );

  const skillCategories = useQuery(
    api.skills.getSkillCategories,
    currentUser?.collegeId ? { clerkUserId: user!.id, collegeId: currentUser.collegeId } : "skip"
  );

  const userSkills = useQuery(
    api.skills.getUserSkills,
    { clerkUserId: user?.id || "" }
  );

  const leaderboardStats = useQuery(
    api.skills.getLeaderboardStats,
    currentUser?.collegeId ? { clerkUserId: user!.id, collegeId: currentUser.collegeId } : "skip"
  );

  const setAllGhostMode = useMutation(api.skills.setAllGhostMode);

  const handleToggleGhostMode = async () => {
    const isCurrentlyAnonymous = userSkills?.some((s) => s.isAnonymous);
    await setAllGhostMode({
      clerkUserId: user!.id,
      isAnonymous: !isCurrentlyAnonymous,
    });
  };

  const currentLeaderboard = viewMode === "overall" ? overallLeaderboard : skillLeaderboard;

  const filteredLeaderboard = currentLeaderboard?.filter((entry) => {
    if (!searchQuery) return true;
    return entry.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Skills Leaderboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Compete with peers and climb the ranks
          </p>
        </div>

        <Button variant="ghost" onClick={handleToggleGhostMode}>
          {userSkills?.some((s) => s.isAnonymous) ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Profile
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Ghost Mode
            </>
          )}
        </Button>
      </div>

      {leaderboardStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {leaderboardStats.totalParticipants}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Participants</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {leaderboardStats.totalSkills}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Skills</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {leaderboardStats.topScore.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Top Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {leaderboardStats.averageScore}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg Score</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {userRanking && (
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  #{userRanking.rank || "-"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your Rank</p>
              </div>
              <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {userRanking.score?.toLocaleString() || 0} points
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Top {userRanking.percentile || 0}% • {userRanking.totalParticipants} participants
                </p>
              </div>
            </div>
            {userSkills && userSkills.length > 0 && (
              <div className="hidden md:flex gap-2">
                {userSkills.slice(0, 3).map((skill) => (
                  <span
                    key={skill._id}
                    className="px-2 py-1 text-xs bg-white dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"
                  >
                    {skill.skillName}: {skill.score}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("overall")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                viewMode === "overall"
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-1" />
              Overall
            </button>
            <button
              onClick={() => setViewMode("skill")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                viewMode === "skill"
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Medal className="w-4 h-4 inline mr-1" />
              By Skill
            </button>
          </div>

          {viewMode === "skill" && skillCategories && (
            <select
              value={selectedSkill || ""}
              onChange={(e) => setSelectedSkill(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="">Select a skill</option>
              {skillCategories.skills.map((skill) => (
                <option key={skill.name} value={skill.name}>
                  {skill.name} (Top: {skill.topScore})
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </Card>

      {filteredLeaderboard && filteredLeaderboard.length > 0 ? (
        <div className="space-y-2">
          {filteredLeaderboard.map((entry, index) => (
            <LeaderboardRow
              key={`${entry.userId}-${'skillName' in entry ? entry.skillName : index}`}
              rank={entry.rank}
              userId={entry.userId}
              displayName={entry.displayName}
              isAnonymous={entry.isAnonymous}
              score={'score' in entry ? entry.score : entry.totalScore || 0}
              totalScore={'totalScore' in entry ? entry.totalScore : undefined}
              skillName={'skillName' in entry ? entry.skillName : undefined}
              skillCount={'skillCount' in entry ? entry.skillCount : undefined}
              topSkills={'topSkills' in entry ? entry.topSkills : undefined}
              badges={'badges' in entry ? entry.badges : undefined}
              isCurrentUser={entry.isCurrentUser}
              verifiedAt={'verifiedAt' in entry ? entry.verifiedAt : undefined}
              onToggleGhostMode={entry.isCurrentUser ? handleToggleGhostMode : undefined}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Crown className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No leaderboard data available
          </p>
          {viewMode === "skill" && !selectedSkill && (
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Select a skill to view its leaderboard
            </p>
          )}
        </Card>
      )}

      {userSkills && userSkills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((skill) => (
              <Card key={skill._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {skill.skillName}
                    </h3>
                    {skill.category && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {skill.category}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {skill.score}
                    </p>
                    {skill.badges && skill.badges.length > 0 && (
                      <div className="flex gap-1 justify-end">
                        {skill.badges.map((badge, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
