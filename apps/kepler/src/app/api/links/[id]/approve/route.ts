import { NextResponse } from "next/server";
import { approveLink } from "@/lib/links";
import { getApiUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await ctx.params;
  // Status is enforced in the query filter: only a pending_approval link can move to
  // active, so a double-click or a stale tab cannot re-approve or revive a rejection.
  const ok = await approveLink(user, id);

  if (!ok) {
    return NextResponse.json(
      { error: "That link is no longer awaiting approval" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
