import Link from "next/link";
import { signOut } from "@/auth";
import type { SessionUser } from "@/lib/session";

export default function StaffHeader({
  user,
  pendingCount = 0,
}: {
  user: SessionUser;
  pendingCount?: number;
}) {
  return (
    <header className="border-primary/10 border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-baseline gap-6">
          <Link href="/staff" className="font-display text-primary text-xl tracking-tight italic">
            Soraia
          </Link>
          <span className="text-primary/55 text-[10px] tracking-[0.25em] uppercase">
            Payment Links
          </span>
          {user.role === "admin" && (
            <Link
              href="/staff/admin"
              className="text-primary/60 hover:text-primary flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors"
            >
              Admin
              {pendingCount > 0 && (
                <span
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] leading-none font-medium text-white"
                  title={`${pendingCount} link${pendingCount === 1 ? "" : "s"} awaiting approval`}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-5">
          <span className="text-primary/65 text-xs font-light">{user.email}</span>
          <Link
            href="/staff/change-password"
            className="text-primary/65 hover:text-primary text-xs font-light underline-offset-4 transition-colors hover:underline"
          >
            Password
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/staff/login" });
            }}
          >
            <button
              type="submit"
              className="text-primary/65 hover:text-primary text-xs font-light underline-offset-4 transition-colors hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
