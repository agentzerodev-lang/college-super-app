import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { collegeId, clerkUserId, searchTerm } = await request.json();

    if (!collegeId || !clerkUserId || !searchTerm) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const events = await convex.query(api.events.searchEvents, {
      collegeId,
      clerkUserId,
      searchTerm,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Search events error:", error);
    return NextResponse.json({ error: "Failed to search events" }, { status: 500 });
  }
}
