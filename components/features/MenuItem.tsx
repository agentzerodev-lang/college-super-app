"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Leaf, 
  Clock, 
  Minus, 
  Plus,
  IndianRupee
} from "lucide-react";

interface MenuItemProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: "breakfast" | "main_course" | "snacks" | "beverages" | "desserts";
  imageUrl?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  quantity?: number;
  onAddToCart?: (id: string, quantity: number) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
}

const categoryColors = {
  breakfast: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  main_course: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  snacks: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  beverages: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  desserts: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
};

export function MenuItem({
  id,
  name,
  description,
  price,
  category,
  imageUrl,
  isVeg = true,
  isAvailable = true,
  preparationTime,
  quantity = 0,
  onAddToCart,
  onQuantityChange,
}: MenuItemProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);

  const handleIncrement = () => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    onQuantityChange?.(id, newQuantity);
  };

  const handleDecrement = () => {
    if (localQuantity > 0) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      onQuantityChange?.(id, newQuantity);
    }
  };

  const handleAddToCart = () => {
    setLocalQuantity(1);
    onAddToCart?.(id, 1);
  };

  return (
    <Card className={`overflow-hidden ${!isAvailable ? "opacity-60" : ""}`}>
      <div className="flex gap-3 p-3">
        {imageUrl ? (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {name}
                </h3>
                {isVeg !== undefined && (
                  <span className={`shrink-0 p-0.5 rounded border ${isVeg ? "border-green-500" : "border-red-500"}`}>
                    <Leaf className={`w-3 h-3 ${isVeg ? "text-green-500" : "text-red-500"}`} />
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoryColors[category]}`}>
              {category.replace("_", " ")}
            </span>
            {preparationTime && (
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                {preparationTime} min
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <IndianRupee className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {price}
              </span>
            </div>

            {!isAvailable ? (
              <span className="text-xs text-red-500 font-medium">Unavailable</span>
            ) : localQuantity > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <span className="w-6 text-center font-medium text-slate-900 dark:text-slate-100">
                  {localQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <Button onClick={handleAddToCart} size="sm" variant="primary">
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
