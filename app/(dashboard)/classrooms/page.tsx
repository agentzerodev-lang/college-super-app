"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookClassroomModal } from "@/components/modals/BookClassroomModal";
import { 
  Search, 
  MapPin, 
  Users, 
  Building, 
  Calendar,
  Clock,
  Filter
} from "lucide-react";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Classroom {
  _id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  facilities?: string[];
}

interface Booking {
  _id: string;
  classroomId: string;
  date: number;
  startTime: string;
  endTime: string;
  classroom?: {
    name: string;
    building: string;
  };
}

export default function ClassroomsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedStartTime, setSelectedStartTime] = useState("09:00");
  const [selectedEndTime, setSelectedEndTime] = useState("10:00");
  const [showFilters, setShowFilters] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const allClassrooms = useQuery(
    api.timetable.getAllClassrooms,
    currentUser?.collegeId
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId }
      : "skip"
  );

  const freeClassrooms = useQuery(
    api.timetable.getFreeClassrooms,
    currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          collegeId: currentUser.collegeId,
          dayOfWeek: selectedDay,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
        }
      : "skip"
  );

  const userBookings = useQuery(
    api.timetable.getUserBookings,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const buildings = allClassrooms
    ? [...new Set((allClassrooms as Classroom[]).map((c) => c.building))]
    : [];

  const filteredClassrooms = (freeClassrooms as Classroom[] | undefined)?.filter((classroom) => {
    const matchesSearch = searchQuery
      ? classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.building.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesBuilding = selectedBuilding
      ? classroom.building === selectedBuilding
      : true;
    return matchesSearch && matchesBuilding;
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleBookClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setShowBookingModal(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Free Classrooms
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Find and book available classrooms for your needs
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by room name or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button
            variant={showFilters ? "primary" : "secondary"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Day
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DAYS.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <select
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <select
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIME_SLOTS.filter((t) => t > selectedStartTime).map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Building
                </label>
                <select
                  value={selectedBuilding || ""}
                  onChange={(e) => setSelectedBuilding(e.target.value || null)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Buildings</option>
                  {buildings.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          <span>
            {DAYS[selectedDay]}, {formatTime(selectedStartTime)} - {formatTime(selectedEndTime)}
          </span>
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {filteredClassrooms?.length ?? 0} classrooms available
        </span>
      </div>

      {filteredClassrooms && filteredClassrooms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {classroom.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <Building className="w-4 h-4" />
                    {classroom.building} - Floor {classroom.floor}
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                  Available
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {classroom.capacity} seats
                </span>
              </div>

              {classroom.facilities && classroom.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {classroom.facilities.slice(0, 3).map((facility) => (
                    <span
                      key={facility}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 rounded-full"
                    >
                      {facility}
                    </span>
                  ))}
                  {classroom.facilities.length > 3 && (
                    <span className="text-xs text-slate-400">
                      +{classroom.facilities.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleBookClassroom(classroom as Classroom)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Room
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No classrooms available for the selected time slot
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Try adjusting your filters or selecting a different time
          </p>
        </Card>
      )}

      {userBookings && userBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your Bookings
          </h2>
          <div className="space-y-2">
            {(userBookings as Booking[]).map((booking) => (
              <Card key={booking._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {booking.classroom?.name || "Unknown Room"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedClassroom && (
        <BookClassroomModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedClassroom(null);
          }}
          classroom={selectedClassroom}
          collegeId={currentUser?.collegeId as Id<"colleges">}
          clerkUserId={user!.id}
          selectedDate={(() => {
            const today = new Date();
            const currentDay = today.getDay();
            const diff = selectedDay - currentDay;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + diff);
            return targetDate.toISOString().split("T")[0];
          })()}
          selectedStartTime={selectedStartTime}
          selectedEndTime={selectedEndTime}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedClassroom(null);
          }}
        />
      )}
    </div>
  );
}
