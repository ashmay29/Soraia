import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Deliberately does NOT guard. /staff/login must stay reachable when signed out, and
 * /staff/change-password must stay reachable while the forced-change flag is set.
 * Each page calls requireUser() or requireAdmin() for itself.
 */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
