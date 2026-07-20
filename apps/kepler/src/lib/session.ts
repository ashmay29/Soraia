import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import type { Role } from "./types";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
}

/**
 * auth(), but a session cookie that cannot be decrypted — because it was signed with
 * a previous AUTH_SECRET — is treated as "signed out" rather than crashing the render.
 *
 * Without this, rotating AUTH_SECRET (or a leftover cookie from an earlier build) takes
 * down every page for everyone holding an old cookie, instead of just logging them out.
 * The next successful login overwrites the stale cookie.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    return await auth();
  } catch (err) {
    console.warn(
      "[auth] could not decode session cookie; treating as signed out —",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Authorization for pages. Every staff/admin route calls one of these — hiding a
 * button in the UI is not access control.
 *
 * `allowPasswordChange` exists so the change-password page itself is reachable while
 * the forced-change flag is set; everything else bounces there first.
 */
export async function requireUser(
  opts: { allowPasswordChange?: boolean } = {}
): Promise<SessionUser> {
  const session = await safeAuth();
  if (!session?.user) redirect("/staff/login");

  const user = session.user as SessionUser;
  if (user.mustChangePassword && !opts.allowPasswordChange) {
    redirect("/staff/change-password");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/staff");
  return user;
}

/**
 * Authorization for route handlers. Returns the user or null — callers must return
 * a 401/403 themselves rather than redirecting, since these are called by fetch().
 */
export async function getApiUser(): Promise<SessionUser | null> {
  const session = await safeAuth();
  if (!session?.user) return null;
  const user = session.user as SessionUser;
  // A user who has not set a real password yet cannot take actions.
  if (user.mustChangePassword) return null;
  return user;
}
