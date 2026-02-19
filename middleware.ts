import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  "/api/webhooks(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // HACKATHON: Allow non-onboarded users to access dashboard
  // if (userId && isAuthRoute(req)) {
  //   const onboardingComplete = req.headers.get("x-onboarding-complete");
  //   const destination = onboardingComplete === "true" ? "/dashboard" : "/onboarding";
  //   return Response.redirect(new URL(destination, req.url));
  // }
  
  // Redirect to dashboard after auth
  if (userId && isAuthRoute(req)) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webp)).*)",
    "/(api|trpc)(.*)",
  ],
};
