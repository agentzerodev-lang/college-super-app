"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Utensils, 
  Star, 
  Clock, 
  ChefHat,
  Plus
} from "lucide-react";

interface MealCardProps {
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  menu: string[];
  specialItems?: string[];
  date: number;
  averageRating?: number;
  totalReviews?: number;
  onReview?: () => void;
  onViewDetails?: () => void;
}

const mealTypeConfig = {
  breakfast: { icon: ChefHat, label: "Breakfast", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  lunch: { icon: Utensils, label: "Lunch", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  dinner: { icon: Utensils, label: "Dinner", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  snacks: { icon: Plus, label: "Snacks", color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/30" },
};

export function MealCard({
  mealType,
  menu,
  specialItems = [],
  date,
  averageRating,
  totalReviews = 0,
  onReview,
  onViewDetails,
}: MealCardProps) {
  const config = mealTypeConfig[mealType];
  const MealIcon = config.icon;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeRange = () => {
    const times: Record<string, string> = {
      breakfast: "7:00 AM - 9:30 AM",
      lunch: "12:00 PM - 2:30 PM",
      dinner: "7:00 PM - 9:30 PM",
      snacks: "4:00 PM - 5:30 PM",
    };
    return times[mealType];
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <MealIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {config.label}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {getTimeRange()}
              </div>
            </div>
          </div>
          {averageRating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {formatDate(date)}
        </p>

        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Menu
            </p>
            <div className="flex flex-wrap gap-1">
              {menu.slice(0, 4).map((item, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300"
                >
                  {item}
                </span>
              ))}
              {menu.length > 4 && (
                <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400">
                  +{menu.length - 4} more
                </span>
              )}
            </div>
          </div>

          {specialItems.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                Special Items
              </p>
              <div className="flex flex-wrap gap-1">
                {specialItems.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-700 dark:text-amber-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {totalReviews > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          {onReview && (
            <Button onClick={onReview} variant="primary" size="sm" className="flex-1">
              <Star className="w-4 h-4 mr-1" />
              Rate Meal
            </Button>
          )}
          {onViewDetails && (
            <Button onClick={onViewDetails} variant="secondary" size="sm" className="flex-1">
              Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
