import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runReconciliation } from "@/lib/reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without this check the
 * endpoint is public, and anyone could hammer ICICI's status API using our credentials.
 */
function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set — refusing to run");
    return false;
  }
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handle(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const started = Date.now();
  try {
    const report = await runReconciliation();
    const ms = Date.now() - started;

    // Always log the summary — this is the only visibility into a job nobody watches.
    console.log(`[cron] reconciliation finished in ${ms}ms`, report);
    if (report.resolvedPaid > 0) {
      console.warn(`[cron] recovered ${report.resolvedPaid} payment(s) no callback reported`);
    }

    return NextResponse.json({ ok: true, ms, ...report });
  } catch (err) {
    console.error("[cron] reconciliation threw:", err);
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
  }
}

export const GET = handle; // Vercel Cron issues GET
export const POST = handle; // convenient for manual triggering
