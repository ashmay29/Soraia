import { NextResponse } from "next/server";
import { paymentLinks } from "@/lib/db";
import { initiateSale } from "@/lib/icici/client";
import { startAttempt } from "@/lib/payments";

export const runtime = "nodejs";

const MESSAGES: Record<string, string> = {
  not_found: "This payment link is not valid.",
  already_paid: "This link has already been paid.",
  awaiting_approval: "This payment link is still awaiting approval.",
  expired: "This payment link has expired.",
  unavailable: "This payment link is no longer available.",
  could_not_start: "Could not start the payment. Please try again.",
};

/** Public — the link token is the only credential. */
export async function POST(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;

  const started = await startAttempt(token);
  if ("error" in started) {
    return NextResponse.json(
      { error: MESSAGES[started.error] ?? MESSAGES.could_not_start },
      { status: started.error === "not_found" ? 404 : 409 }
    );
  }

  const { link, merchantTxnNo } = started;

  const sale = await initiateSale({
    merchantTxnNo,
    // The amount comes from the link record, never from the request body.
    amountPaise: link.amountPaise,
    customerName: link.customer?.name,
    customerEmail: link.customer?.email,
    customerPhone: link.customer?.phone,
    description: link.description,
  });

  if (!sale.ok) {
    // Mark the attempt failed so it does not sit pending forever and get picked up
    // by the reconciliation cron as if it were in flight.
    const col = await paymentLinks();
    await col.updateOne(
      { "attempts.merchantTxnNo": merchantTxnNo },
      { $set: { "attempts.$.status": "failed", "attempts.$.updatedAt": new Date() } }
    );
    console.error(`[pay] initiateSale failed for ${merchantTxnNo}:`, sale.message, sale.raw);
    return NextResponse.json(
      { error: sale.message ?? "Could not start the payment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ redirectUrl: sale.redirectUrl });
}
