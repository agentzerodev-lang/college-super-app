import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Note: We don't redirect from auth routes here - let Clerk handle it
  // The redirect after sign-in/sign-up is handled by Clerk components
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webp)).*)",
    "/(api|trpc)(.*)",
  ],
};
