import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const role = ((public_metadata as { role?: string })?.role || "student") as "student" | "faculty" | "admin" | "hostelAdmin" | "canteenAdmin";

    await convex.mutation(api.users.createOrUpdateUser, {
      clerkUserId: id,
      email,
      name: [first_name, last_name].filter(Boolean).join(" ") || "User",
      role,
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const role = ((public_metadata as { role?: string })?.role || "student") as "student" | "faculty" | "admin" | "hostelAdmin" | "canteenAdmin";

    await convex.mutation(api.users.createOrUpdateUser, {
      clerkUserId: id,
      email,
      name: [first_name, last_name].filter(Boolean).join(" ") || "User",
      role,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
