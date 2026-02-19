"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MenuItem } from "@/components/features/MenuItem";
import { 
  Coffee, 
  ShoppingBag, 
  Clock,
  Store,
  Search,
  IndianRupee,
  Trash2,
  Loader2
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CanteenPage() {
  const { user } = useUser();
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const canteens = useQuery(
    api.canteen.getCanteens,
    currentUser?.collegeId ? { clerkUserId: user!.id, collegeId: currentUser.collegeId } : "skip"
  );

  const menuItems = useQuery(
    api.canteen.getAvailableItems,
    selectedCanteen ? { clerkUserId: user!.id, canteenId: selectedCanteen as any } : "skip"
  );

  const userOrders = useQuery(
    api.canteen.getUserOrders,
    { clerkUserId: user?.id || "", limit: 5 }
  );

  const createOrder = useMutation(api.canteen.createOrder);

  const isCanteenAdmin = currentUser?.role === "canteenAdmin" || currentUser?.role === "admin";

  const categories = [
    { id: "breakfast", label: "Breakfast", icon: Coffee },
    { id: "main_course", label: "Main Course", icon: Store },
    { id: "snacks", label: "Snacks", icon: Coffee },
    { id: "beverages", label: "Beverages", icon: Coffee },
    { id: "desserts", label: "Desserts", icon: Coffee },
  ];

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    
    let items = menuItems;
    
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleAddToCart = (id: string, name: string, price: number, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id, name, price, quantity }];
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedCanteen || !currentUser?.collegeId || cart.length === 0) return;
    
    await createOrder({
      clerkUserId: user!.id,
      canteenId: selectedCanteen as any,
      collegeId: currentUser.collegeId,
      items: cart.map((item) => ({
        itemId: item.id as any,
        quantity: item.quantity,
      })),
    });
    
    setCart([]);
    setShowCart(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      preparing: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      ready: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      delivered: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    };
    return colors[status] || colors.pending;
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
            Canteen
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Order food from campus canteens
          </p>
        </div>

        {isCanteenAdmin && (
          <Button variant="primary">
            <Store className="w-4 h-4 mr-2" />
            Manage Menu
          </Button>
        )}
      </div>

      {!selectedCanteen && canteens && canteens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canteens.map((canteen) => (
            <Card
              key={canteen._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCanteen(canteen._id)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                    <Store className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {canteen.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {canteen.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {canteen.openingTime} - {canteen.closingTime}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedCanteen && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedCanteen(null)}>
              ← Back to Canteens
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>

          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                    !selectedCategory
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <MenuItem
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  category={item.category}
                  imageUrl={item.imageUrl}
                  isVeg={item.isVeg}
                  isAvailable={item.isAvailable}
                  preparationTime={item.preparationTime}
                  quantity={cart.find((c) => c.id === item._id)?.quantity || 0}
                  onAddToCart={(id, qty) => handleAddToCart(id, item.name, item.price, qty)}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No items found
              </p>
            </Card>
          )}
        </>
      )}

      {userOrders && userOrders.length > 0 && !selectedCanteen && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {userOrders.map((order) => (
              <Card key={order._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <Card className="w-full md:max-w-md md:rounded-xl rounded-b-none max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Your Cart
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Your cart is empty
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        ₹{item.price * item.quantity}
                      </p>
                      <button
                        onClick={() => handleQuantityChange(item.id, 0)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Total
                  </span>
                  <div className="flex items-center text-xl font-bold text-slate-900 dark:text-slate-100">
                    <IndianRupee className="w-5 h-5" />
                    {cartTotal}
                  </div>
                </div>
                <Button variant="primary" className="w-full" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
