import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export type Role = "student" | "faculty" | "admin" | "hostelAdmin" | "canteenAdmin";

export interface AuthResult {
  isAuthenticated: boolean;
  userId: Id<"users"> | null;
  clerkUserId: string | null;
  role: Role | null;
  user: Doc<"users"> | null;
}

export const ADMIN_ONLY: Role[] = ["admin"];
export const FACULTY_ADMIN: Role[] = ["faculty", "admin"];
export const HOSTEL_ADMIN: Role[] = ["hostelAdmin", "admin"];
export const CANTEEN_ADMIN: Role[] = ["canteenAdmin", "admin"];
export const ALL_ROLES: Role[] = ["student", "faculty", "admin", "hostelAdmin", "canteenAdmin"];
export const STUDENT_ONLY: Role[] = ["student"];
export const STAFF_ONLY: Role[] = ["faculty", "admin", "hostelAdmin", "canteenAdmin"];

export async function getAuth(
  ctx: QueryCtx | MutationCtx,
  clerkUserId: string | null | undefined
): Promise<AuthResult> {
  if (!clerkUserId) {
    return {
      isAuthenticated: false,
      userId: null,
      clerkUserId: null,
      role: null,
      user: null,
    };
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!user || user.status !== "active") {
    return {
      isAuthenticated: false,
      userId: null,
      clerkUserId,
      role: null,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    userId: user._id,
    clerkUserId,
    role: user.role as Role,
    user,
  };
}

export function hasRole(auth: AuthResult, allowedRoles: Role[]): boolean {
  if (!auth.isAuthenticated || !auth.role) {
    return false;
  }
  return allowedRoles.includes(auth.role);
}

export function requireAuth(auth: AuthResult): Id<"users"> {
  if (!auth.isAuthenticated || !auth.userId) {
    throw new Error("Authentication required");
  }
  return auth.userId;
}

export function requireRole(auth: AuthResult, allowedRoles: Role[]): Id<"users"> {
  const userId = requireAuth(auth);
  if (!auth.role || !allowedRoles.includes(auth.role)) {
    throw new Error(`Role not authorized. Required: ${allowedRoles.join(", ")}`);
  }
  return userId;
}
