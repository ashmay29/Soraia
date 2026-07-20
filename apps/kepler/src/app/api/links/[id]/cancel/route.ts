import { NextResponse } from "next/server";
import { cancelLink } from "@/lib/links";
import { getApiUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  const { id } = await ctx.params;
  const ok = await cancelLink(user, id);

  if (!ok) {
    // Ownership and status are enforced in the query filter, so a failure here means
    // the link is missing, already paid, or belongs to someone else. Deliberately
    // one message for all three — do not leak which.
    return NextResponse.json({ error: "That link cannot be cancelled" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
