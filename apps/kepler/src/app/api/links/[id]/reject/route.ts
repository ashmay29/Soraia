import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectLink } from "@/lib/links";
import { getApiUser } from "@/lib/session";

export const runtime = "nodejs";

const schema = z.object({ reason: z.string().trim().max(200).optional() });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const { id } = await ctx.params;
  const ok = await rejectLink(user, id, parsed.data.reason ?? "");

  if (!ok) {
    return NextResponse.json(
      { error: "That link is no longer awaiting approval" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
