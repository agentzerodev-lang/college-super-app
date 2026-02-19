"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TicketCard } from "@/components/features/TicketCard";
import { CreateTicketModal } from "@/components/modals/CreateTicketModal";
import { Id } from "@/convex/_generated/dataModel";
import {
  Ticket,
  Filter,
  Plus,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function TicketsPage() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const myTickets = useQuery(
    api.tickets.getMyTickets,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const collegeTickets = useQuery(
    api.tickets.getByCollege,
    currentUser?.collegeId
      ? {
          clerkUserId: user!.id,
          collegeId: currentUser.collegeId,
          status: selectedStatus as any,
          category: selectedCategory as any,
        }
      : "skip"
  );

  const updateStatus = useMutation(api.tickets.updateStatus);

  const categories = [
    { id: "technical", label: "Technical", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    { id: "academic", label: "Academic", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    { id: "facility", label: "Facility", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
    { id: "hostel", label: "Hostel", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
    { id: "other", label: "Other", color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400" },
  ];

  const statuses = [
    { id: "open", label: "Open", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    { id: "in_progress", label: "In Progress", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" },
    { id: "resolved", label: "Resolved", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    { id: "closed", label: "Closed", color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400" },
  ];

  const filteredTickets = collegeTickets?.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query)
    );
  });

  const handleUpdateStatus = async (ticketId: string, status: "open" | "in_progress" | "resolved" | "closed") => {
    await updateStatus({
      clerkUserId: user!.id,
      ticketId: ticketId as Id<"tickets">,
      status,
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Support Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage and track your support requests
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">Category:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? "bg-primary/10 text-primary"
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
                      ? cat.color
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">Status:</span>
              <button
                onClick={() => setSelectedStatus(null)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  !selectedStatus
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                    selectedStatus === status.id
                      ? status.color
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {myTickets && myTickets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            My Tickets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTickets.slice(0, 3).map((ticket) => (
              <TicketCard
                key={ticket._id}
                title={ticket.title}
                description={ticket.description}
                category={ticket.category}
                priority={ticket.priority}
                status={ticket.status}
                createdAt={ticket.createdAt}
                resolvedAt={ticket.resolvedAt}
                canUpdate={true}
                onUpdateStatus={(status) => handleUpdateStatus(ticket._id, status)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          All Tickets
        </h2>
        
        {filteredTickets && filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                title={ticket.title}
                description={ticket.description}
                category={ticket.category}
                priority={ticket.priority}
                status={ticket.status}
                createdAt={ticket.createdAt}
                resolvedAt={ticket.resolvedAt}
                canUpdate={true}
                onUpdateStatus={(status) => handleUpdateStatus(ticket._id, status)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No tickets found
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Create a new ticket to get started
            </p>
          </Card>
        )}
      </div>

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        collegeId={currentUser?.collegeId as Id<"colleges">}
        clerkUserId={user!.id}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
