"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TicketCard } from "@/components/features/TicketCard";
import { 
  Search, 
  Plus, 
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "technical" | "academic" | "facility" | "hostel" | "other";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: "low" | "medium" | "high" | "urgent";
  status: TicketStatus;
  createdAt: number;
  resolvedAt?: number;
}

export default function TicketsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const myTickets = useQuery(
    api.tickets.getMyTickets,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const allTickets = useQuery(
    api.tickets.getByCollege,
    currentUser?.collegeId && activeTab === "all"
      ? { 
          clerkUserId: user!.id, 
          collegeId: currentUser.collegeId,
          status: selectedStatus ?? undefined,
          category: selectedCategory ?? undefined,
        }
      : "skip"
  );

  const assignedTickets = useQuery(
    api.tickets.getAssignedToMe,
    user?.id && (currentUser?.role === "faculty" || currentUser?.role === "admin")
      ? { clerkUserId: user.id }
      : "skip"
  );

  const ticketStats = useQuery(
    api.tickets.getStats,
    currentUser?.collegeId && (currentUser?.role === "faculty" || currentUser?.role === "admin")
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId }
      : "skip"
  );

  const updateStatus = useMutation(api.tickets.updateStatus);

  const isStaff = currentUser?.role === "faculty" || 
                  currentUser?.role === "admin" || 
                  currentUser?.role === "hostelAdmin" ||
                  currentUser?.role === "canteenAdmin";

  const categories: { value: TicketCategory | null; label: string }[] = [
    { value: null, label: "All Categories" },
    { value: "technical", label: "Technical" },
    { value: "academic", label: "Academic" },
    { value: "facility", label: "Facility" },
    { value: "hostel", label: "Hostel" },
    { value: "other", label: "Other" },
  ];

  const statuses: { value: TicketStatus | null; label: string; icon: React.ElementType; color: string }[] = [
    { value: null, label: "All Status", icon: Filter, color: "" },
    { value: "open", label: "Open", icon: AlertCircle, color: "text-blue-500" },
    { value: "in_progress", label: "In Progress", icon: Clock, color: "text-yellow-500" },
    { value: "resolved", label: "Resolved", icon: CheckCircle2, color: "text-green-500" },
    { value: "closed", label: "Closed", icon: XCircle, color: "text-slate-500" },
  ];

  const tickets = activeTab === "my" ? myTickets : allTickets;

  const filteredTickets = (tickets as Ticket[] | undefined)?.filter((ticket) => {
    const matchesSearch = searchQuery
      ? ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus = selectedStatus ? ticket.status === selectedStatus : true;
    const matchesCategory = selectedCategory ? ticket.category === selectedCategory : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    await updateStatus({
      clerkUserId: user!.id,
      ticketId: ticketId as Id<"tickets">,
      status,
    });
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
            Support Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create and track support requests
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {isStaff && ticketStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                <BarChart3 className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {ticketStats.total}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {ticketStats.open}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Open</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {ticketStats.inProgress}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {ticketStats.resolved}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Resolved</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                <XCircle className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {ticketStats.closed}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Closed</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => setSelectedCategory((e.target.value || null) as TicketCategory | null)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat.label} value={cat.value ?? ""}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus ?? ""}
              onChange={(e) => setSelectedStatus((e.target.value || null) as TicketStatus | null)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {statuses.map((status) => (
                <option key={status.label} value={status.value ?? ""}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "my"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          My Tickets
        </button>
        {isStaff && (
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            All Tickets
          </button>
        )}
        {isStaff && assignedTickets && assignedTickets.length > 0 && (
          <button
            className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            Assigned ({assignedTickets.length})
          </button>
        )}
      </div>

      {filteredTickets && filteredTickets.length > 0 ? (
        <div className="space-y-4">
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
              canAssign={isStaff}
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
            {searchQuery || selectedStatus || selectedCategory
              ? "Try adjusting your search or filters"
              : "Create a new ticket to get started"}
          </p>
          <Button variant="primary" className="mt-4" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </Card>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Ticket</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Create ticket modal placeholder - implement form here
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowCreateModal(false)} className="flex-1">
                Create
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
