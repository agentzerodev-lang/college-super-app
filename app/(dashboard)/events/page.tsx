"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/features/EventCard";
import { CreateEventModal } from "@/components/modals/CreateEventModal";
import { 
  Calendar as CalendarIcon,
  Plus,
  Search,
  Ticket,
  Loader2
} from "lucide-react";

export default function EventsPage() {
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const events = useQuery(
    api.events.getByCollege,
    currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          collegeId: currentUser.collegeId,
          type: selectedType as any,
          upcomingOnly: showOnlyUpcoming,
        }
      : "skip"
  );

  const myRegistrations = useQuery(
    api.events.getMyRegistrations,
    { clerkUserId: user?.id || "" }
  );

  const register = useMutation(api.events.register);
  const cancelRegistration = useMutation(api.events.cancelRegistration);

  const eventTypes = [
    { id: "academic", label: "Academic", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    { id: "cultural", label: "Cultural", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    { id: "sports", label: "Sports", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    { id: "workshop", label: "Workshop", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
    { id: "seminar", label: "Seminar", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
    { id: "competition", label: "Competition", color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  ];

  const filteredEvents = events?.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const isRegisteredForEvent = (eventId: string) => {
    return myRegistrations?.some((reg) => reg.eventId === eventId);
  };

  const handleRegister = async (eventId: string) => {
    await register({
      clerkUserId: user!.id,
      eventId: eventId as any,
    });
  };

  const handleCancelRegistration = async (eventId: string) => {
    await cancelRegistration({
      clerkUserId: user!.id,
      eventId: eventId as any,
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
            Events & Hackathons
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Discover and register for campus events
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showOnlyUpcoming ? "primary" : "secondary"}
            onClick={() => setShowOnlyUpcoming(!showOnlyUpcoming)}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {showOnlyUpcoming ? "Upcoming" : "All Events"}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (!currentUser?.collegeId) {
                alert("Please complete onboarding first to create events.");
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                !selectedType
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  selectedType === type.id
                    ? type.color
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {myRegistrations && myRegistrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            My Registrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRegistrations.slice(0, 3).map((reg) => (
              <Card key={reg._id} className="p-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    reg.status === "registered"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : reg.status === "waitlisted"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}>
                    {reg.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {showOnlyUpcoming ? "Upcoming Events" : "All Events"}
        </h2>
        
        {filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                title={event.title}
                description={event.description}
                type={event.type}
                startTime={event.startTime}
                endTime={event.endTime}
                location={event.location}
                imageUrl={event.imageUrl}
                tags={event.tags}
                maxAttendees={event.maxAttendees}
                registrationCount={event.registrationCount}
                isRegistered={isRegisteredForEvent(event._id)}
                isPublic={event.isPublic}
                creatorName={event.creatorName}
                onRegister={() => handleRegister(event._id)}
                onCancelRegistration={() => handleCancelRegistration(event._id)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No events found
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Check back later or create a new event
            </p>
          </Card>
        )}
      </div>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        collegeId={currentUser?.collegeId}
        clerkUserId={user!.id}
        onSuccess={() => {
        }}
      />
    </div>
  );
}
