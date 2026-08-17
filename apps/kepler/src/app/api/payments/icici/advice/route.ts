import { NextResponse } from "next/server";
import { merchantKey, verifyInboundHash } from "@/lib/icici/hash";
import { parseCallbackBody, withHeaderHash } from "@/lib/icici/inbound";
import { applyPaymentResult } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Payment Advice — the SOURCE OF TRUTH for payment status.
 *
 * Server-to-server, no browser involved. ICICI retries until it receives a 200, so
 * every path that has finished its work returns 200 even when nothing changed;
 * returning 500 on an already-processed callback would make them retry forever.
 *
 * It also reports LATER changes — a payment confirmed days ago can be reversed here.
 */
export async function POST(req: Request) {
  const { params: body, raw } = await parseCallbackBody(req);
  const params = withHeaderHash(body, req);

  if (!verifyInboundHash(params, merchantKey())) {
    // A bad signature is the one case worth rejecting outright. Do not 200 it —
    // if it is genuinely from ICICI, we want the retry and the alarm.
    console.error("[icici/advice] signature verification FAILED", { raw });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const result = await applyPaymentResult(params, "advice");

  if (!result.applied) {
    // Unknown transaction. Retrying will not help, so acknowledge and log rather
    // than leaving ICICI to retry indefinitely.
    console.error("[icici/advice] could not apply:", result.reason, { params });
    return NextResponse.json({ received: true, applied: false }, { status: 200 });
  }

  return NextResponse.json({ received: true, status: result.status }, { status: 200 });
}
