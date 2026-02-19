"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Clock,
  Users,
  Dumbbell,
  MapPin,
  Loader2
} from "lucide-react";

const sportTypes = [
  { id: "cricket", label: "Cricket", icon: "🏏" },
  { id: "football", label: "Football", icon: "⚽" },
  { id: "basketball", label: "Basketball", icon: "🏀" },
  { id: "tennis", label: "Tennis", icon: "🎾" },
  { id: "badminton", label: "Badminton", icon: "🏸" },
  { id: "volleyball", label: "Volleyball", icon: "🏐" },
  { id: "gym", label: "Gym", icon: "💪" },
  { id: "swimming", label: "Swimming", icon: "🏊" },
];

export default function PlaygroundPage() {
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedPlayground, setSelectedPlayground] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const playgrounds = useQuery(
    api.playground.getByCollege,
    currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          collegeId: currentUser.collegeId,
          type: selectedType as any,
        }
      : "skip"
  );

  const slots = useQuery(
    api.playground.getSlotsByPlayground,
    selectedPlayground
      ? {
          clerkUserId: user!.id,
          playgroundId: selectedPlayground as any,
          date: new Date(selectedDate).getTime(),
        }
      : "skip"
  );

  const myBookings = useQuery(
    api.playground.getMyBookings,
    { clerkUserId: user?.id || "" }
  );

  const bookSlot = useMutation(api.playground.bookSlot);
  const cancelBooking = useMutation(api.playground.cancelBooking);

  const isStaff = currentUser?.role && ["faculty", "admin", "hostelAdmin", "canteenAdmin"].includes(currentUser.role);

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    
    await bookSlot({
      clerkUserId: user!.id,
      slotId: selectedSlot as any,
    });
    
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  const handleCancelBooking = async (slotId: string) => {
    await cancelBooking({
      clerkUserId: user!.id,
      slotId: slotId as any,
    });
  };

  const getSportIcon = (type: string) => {
    const sport = sportTypes.find((s) => s.id === type);
    return sport?.icon || "🏟️";
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const availableSlots = useMemo(() => {
    if (!slots) return [];
    return slots.filter((slot) => slot.status === "available" || slot.status === "booked");
  }, [slots]);

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
            Playground & Sports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Book slots for sports facilities
          </p>
        </div>

        {isStaff && (
          <Button variant="primary">
            <Dumbbell className="w-4 h-4 mr-2" />
            Manage Slots
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sport Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  !selectedType
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                All
              </button>
              {sportTypes.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setSelectedType(sport.id)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedType === sport.id
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {sport.icon} {sport.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {playgrounds && playgrounds.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Available Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playgrounds.map((playground) => (
              <Card
                key={playground._id}
                className={`cursor-pointer transition-all ${
                  selectedPlayground === playground._id
                    ? "ring-2 ring-indigo-500"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPlayground(playground._id)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getSportIcon(playground.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {playground.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {playground.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        {playground.capacity}
                      </div>
                    </div>
                  </div>
                  
                  {playground.location && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {playground.location}
                    </div>
                  )}

                  {playground.facilities && playground.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {playground.facilities.slice(0, 3).map((facility, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedPlayground && availableSlots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Available Slots
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableSlots.map((slot) => {
              const isBooked = slot.status === "booked";
              const isFull = (slot.currentParticipants || 0) >= (slot.maxParticipants || 0);
              
              return (
                <Card
                  key={slot._id}
                  className={`p-3 ${
                    isBooked && !isFull
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                      : isFull
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      <Clock className="w-4 h-4" />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Users className="w-3 h-3" />
                      {slot.currentParticipants} / {slot.maxParticipants}
                    </div>

                    {!isFull ? (
                      <Button
                        variant={isBooked ? "secondary" : "primary"}
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          setSelectedSlot(slot._id);
                          setShowBookingModal(true);
                        }}
                      >
                        {isBooked ? "Join" : "Book"}
                      </Button>
                    ) : (
                      <span className="text-xs text-red-500 mt-2 block">Full</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {myBookings && myBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            My Bookings
          </h2>
          <div className="space-y-3">
            {myBookings.slice(0, 5).map((booking) => (
              <Card key={booking._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Slot on {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <Users className="w-4 h-4" />
                      {booking.currentParticipants} / {booking.maxParticipants} participants
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === "booked"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === "booked" && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Confirm Booking
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to book this slot?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleBookSlot} className="flex-1">
                  Confirm
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
