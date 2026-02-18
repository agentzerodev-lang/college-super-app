import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Role } from "@/convex/auth";

export interface UserProfile {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: Role;
  branch?: string;
  year?: number;
  phone?: string;
  status: string;
}

export function useCurrentUser() {
  const { user, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  
  const convexUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const isLoaded = isClerkLoaded && convexUser !== undefined;

  if (!isLoaded) {
    return { isLoaded: false, user: null, profile: null };
  }

  if (!isSignedIn || !user) {
    return { isLoaded: true, user: null, profile: null };
  }

  const profile: UserProfile | null = convexUser
    ? {
        id: convexUser._id,
        clerkUserId: convexUser.clerkUserId,
        email: convexUser.email,
        name: convexUser.name,
        role: convexUser.role as Role,
        branch: convexUser.branch,
        year: convexUser.year,
        phone: convexUser.phone,
        status: convexUser.status,
      }
    : null;

  return {
    isLoaded: true,
    user,
    profile,
    isOnboarded: !!(
      profile &&
      user.unsafeMetadata?.onboardingComplete === true
    ),
  };
}

export function useRole() {
  const { profile, isLoaded } = useCurrentUser();

  return {
    isLoaded,
    role: profile?.role ?? null,
    isAdmin: profile?.role === "admin",
    isFaculty: profile?.role === "faculty",
    isStudent: profile?.role === "student",
    isHostelAdmin: profile?.role === "hostelAdmin",
    isCanteenAdmin: profile?.role === "canteenAdmin",
    isStaff: profile?.role
      ? ["faculty", "admin", "hostelAdmin", "canteenAdmin"].includes(
          profile.role
        )
      : false,
  };
}

export function requireAuth(profile: UserProfile | null): UserProfile {
  if (!profile) {
    throw new Error("Authentication required");
  }
  return profile;
}

export function requireRole(
  profile: UserProfile | null,
  allowedRoles: Role[]
): UserProfile {
  const user = requireAuth(profile);
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Role not authorized. Required: ${allowedRoles.join(", ")}`);
  }
  return user;
}
