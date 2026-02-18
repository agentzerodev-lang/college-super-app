import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface TicketData {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority: string;
}

export async function POST(request: NextRequest) {
  try {
    const { collegeId, clerkUserId, searchTerm } = await request.json();

    if (!collegeId || !clerkUserId || !searchTerm) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tickets = await convex.query(api.tickets.getByCollege, {
      collegeId,
      clerkUserId,
    });

    const lowerSearch = searchTerm.toLowerCase();
    const filteredTickets = (tickets as TicketData[]).filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(lowerSearch) ||
        ticket.description?.toLowerCase().includes(lowerSearch)
    );

    return NextResponse.json(filteredTickets.slice(0, 20));
  } catch (error) {
    console.error("Search tickets error:", error);
    return NextResponse.json({ error: "Failed to search tickets" }, { status: 500 });
  }
}
