"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MealCard } from "@/components/features/MealCard";
import { 
  Building2, 
  Star, 
  Calendar,
  Filter,
  Utensils,
  MessageSquare,
  ChefHat,
  Loader2
} from "lucide-react";

export default function HostelPage() {
  const { user } = useUser();
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "all">("today");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    cleanlinessRating: 5,
    foodRating: 5,
    facilitiesRating: 5,
    comment: "",
  });

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const hostels = useQuery(
    api.hostel.getHostels,
    currentUser?.collegeId ? { clerkUserId: user!.id, collegeId: currentUser.collegeId } : "skip"
  );

  const meals = useQuery(
    api.hostel.getMealsByHostel,
    selectedHostel && currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          hostelId: selectedHostel as any,
          startDate: dateFilter === "today" ? new Date().setHours(0, 0, 0, 0) : undefined,
          endDate: dateFilter === "today" ? new Date().setHours(23, 59, 59, 999) : undefined,
        }
      : "skip"
  );

  const hostelRatings = useQuery(
    api.hostel.getHostelRatings,
    selectedHostel ? { clerkUserId: user!.id, hostelId: selectedHostel as any } : "skip"
  );

  const reviews = useQuery(
    api.hostel.getReviewsByHostel,
    selectedHostel ? { clerkUserId: user!.id, hostelId: selectedHostel as any, limit: 10 } : "skip"
  );

  const createReview = useMutation(api.hostel.createReview);

  const isHostelAdmin = currentUser?.role === "hostelAdmin" || currentUser?.role === "admin";

  const getMealTypeOrder = (mealType: string) => {
    const order = { breakfast: 1, lunch: 2, snacks: 3, dinner: 4 };
    return order[mealType as keyof typeof order] || 5;
  };

  const sortedMeals = meals?.sort((a, b) => {
    const dateCompare = a.date - b.date;
    if (dateCompare !== 0) return dateCompare;
    return getMealTypeOrder(a.mealType) - getMealTypeOrder(b.mealType);
  });

  const handleSubmitReview = async () => {
    if (!selectedHostel || !currentUser?.collegeId) return;
    
    await createReview({
      clerkUserId: user!.id,
      hostelId: selectedHostel as any,
      collegeId: currentUser.collegeId,
      rating: reviewData.rating,
      cleanlinessRating: reviewData.cleanlinessRating,
      foodRating: reviewData.foodRating,
      facilitiesRating: reviewData.facilitiesRating,
      comment: reviewData.comment || undefined,
    });
    
    setShowReviewModal(false);
    setReviewData({
      rating: 5,
      cleanlinessRating: 5,
      foodRating: 5,
      facilitiesRating: 5,
      comment: "",
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
            Hostel Meals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View daily meals and share your feedback
          </p>
        </div>

        {isHostelAdmin && (
          <Button variant="primary">
            <ChefHat className="w-4 h-4 mr-2" />
            Manage Meals
          </Button>
        )}
      </div>

      {!selectedHostel && hostels && hostels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostels.map((hostel) => (
            <Card
              key={hostel._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedHostel(hostel._id)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {hostel.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {hostel.type} • {hostel.code}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedHostel && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" onClick={() => setSelectedHostel(null)}>
              ← Back to Hostels
            </Button>
          </div>

          {hostelRatings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {hostelRatings.averageRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Overall Rating
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">🧹</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {hostelRatings.averageCleanliness.toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Cleanliness</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Utensils className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {hostelRatings.averageFood.toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Food</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {hostelRatings.averageFacilities.toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Facilities</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
              {(["today", "week", "all"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    dateFilter === filter
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReviewModal(true)}
                className="ml-auto"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Write Review
              </Button>
            </div>
          </Card>

          {sortedMeals && sortedMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMeals.map((meal) => (
                <MealCard
                  key={meal._id}
                  mealType={meal.mealType}
                  menu={meal.menu}
                  specialItems={meal.specialItems}
                  date={meal.date}
                  onReview={() => setShowReviewModal(true)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No meals scheduled for this period
              </p>
            </Card>
          )}

          {reviews && reviews.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Recent Reviews
              </h2>
              <div className="space-y-3">
                {reviews.slice(0, 5).map((review) => (
                  <Card key={review._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {review.userName}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {review.comment}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Write a Review
              </h2>

              <div className="space-y-4">
                {[
                  { label: "Overall Rating", key: "rating" as const },
                  { label: "Cleanliness", key: "cleanlinessRating" as const },
                  { label: "Food Quality", key: "foodRating" as const },
                  { label: "Facilities", key: "facilitiesRating" as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {label}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewData((prev) => ({ ...prev, [key]: star }))}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewData[key]
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Comment (optional)
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData((prev) => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowReviewModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmitReview} className="flex-1">
                  Submit Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
