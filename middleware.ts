import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (!isPublicRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return Response.redirect(signInUrl);
    }

    const onboardingComplete = sessionClaims?.onboardingComplete as boolean | undefined;
    if (!onboardingComplete && !isOnboardingRoute(req)) {
      const onboardingUrl = new URL("/onboarding", req.url);
      return Response.redirect(onboardingUrl);
    }
  }

  if (userId && isPublicRoute(req)) {
    const onboardingComplete = sessionClaims?.onboardingComplete as boolean | undefined;
    if (!onboardingComplete) {
      const onboardingUrl = new URL("/onboarding", req.url);
      return Response.redirect(onboardingUrl);
    }
    return Response.redirect(new URL("/home", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webp)).*)",
    "/(api|trpc)(.*)",
  ],
};
