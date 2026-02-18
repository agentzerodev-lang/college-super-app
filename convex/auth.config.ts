export default {
  providers: [
    {
      domain: process.env.CLERK_JWKS_URL ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.replace("pk_", "https://") ?? "",
      applicationID: "convex",
    },
  ],
};
