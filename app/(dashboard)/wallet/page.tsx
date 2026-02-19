"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Clock,
  IndianRupee,
  Star,
  Award,
  Loader2
} from "lucide-react";

export default function WalletPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "rewards">("overview");

  const wallet = useQuery(
    api.wallet.getWallet,
    { clerkUserId: user?.id || "" }
  );

  const transactions = useQuery(
    api.wallet.getTransactions,
    { clerkUserId: user?.id || "", limit: 20 }
  );

  const rewards = useQuery(
    api.wallet.getUserRewards,
    { clerkUserId: user?.id || "" }
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      topup: "💰",
      canteen: "🍽️",
      print: "🖨️",
      library_fine: "📚",
      refund: "↩️",
      reward: "🎁",
      other: "💳",
    };
    return icons[category] || icons.other;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

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
            Wallet & Rewards
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your balance and view rewards
          </p>
        </div>
      </div>

      {wallet && (
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Available Balance</p>
              <div className="flex items-center gap-1 mt-1">
                <IndianRupee className="w-6 h-6" />
                <span className="text-3xl font-bold">
                  {wallet.balance.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          
          {wallet.status === "frozen" && (
            <div className="mt-4 px-3 py-2 bg-red-500/20 rounded-lg text-sm">
              ⚠️ Your wallet is frozen. Contact admin for assistance.
            </div>
          )}
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
            activeTab === "overview"
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
            activeTab === "transactions"
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
            activeTab === "rewards"
              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Rewards
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center">
                <span className="text-2xl">💰</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Top Up</p>
              </button>
              <button className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center">
                <span className="text-2xl">📤</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Transfer</p>
              </button>
              <button className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center">
                <span className="text-2xl">📊</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Statement</p>
              </button>
              <button className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center">
                <span className="text-2xl">⚙️</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Settings</p>
              </button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Recent Transactions
            </h3>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(tx.category)}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {tx.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      tx.type === "credit" ? "text-green-500" : "text-red-500"
                    }`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-4">
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        tx.type === "credit"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="capitalize">{tx.category.replace("_", " ")}</span>
                          <span>•</span>
                          <span>{formatDate(tx.createdAt)} {formatTime(tx.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        tx.type === "credit" ? "text-green-500" : "text-red-500"
                      }`}>
                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Balance: ₹{tx.balanceAfter}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No transactions yet
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="space-y-4">
          {rewards && rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <Card key={reward._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      {reward.type === "badge" ? (
                        <Award className="w-6 h-6 text-yellow-500" />
                      ) : reward.type === "certificate" ? (
                        <Star className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <Gift className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {reward.name}
                      </p>
                      {reward.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {reward.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          reward.type === "points"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : reward.type === "badge"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        }`}>
                          {reward.type}
                        </span>
                        {reward.points && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {reward.points} points
                          </span>
                        )}
                      </div>
                      {reward.source && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          Earned from: {reward.source}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Gift className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No rewards earned yet
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Participate in events and activities to earn rewards!
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
