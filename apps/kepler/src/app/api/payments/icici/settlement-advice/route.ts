import { NextResponse } from "next/server";
import { gatewayEvents, paymentLinks } from "@/lib/db";
import { merchantKey, verifyInboundHash } from "@/lib/icici/hash";
import { parseCallbackBody, withHeaderHash } from "@/lib/icici/inbound";
import { parseIciciDate } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown): string | undefined {
  return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
}

/**
 * Settlement Advice — tells us when money actually reaches the merchant account.
 *
 * Distinct from payment status: a payment can be successful today and settle days
 * later. This never changes whether a link is paid; it only records the payout.
 */
export async function POST(req: Request) {
  const { params: body, raw } = await parseCallbackBody(req);
  const params = withHeaderHash(body, req);

  if (!verifyInboundHash(params, merchantKey())) {
    console.error("[icici/settlement] signature verification FAILED", { raw });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const merchantTxnNo = str(params.merchantTxnNo) ?? "";

  const events = await gatewayEvents();
  await events.insertOne({
    merchantTxnNo,
    source: "settlement",
    payload: params,
    receivedAt: new Date(),
  });

  if (!merchantTxnNo) {
    console.error("[icici/settlement] no merchantTxnNo in payload", { params });
    return NextResponse.json({ received: true, applied: false }, { status: 200 });
  }

  const settlementFields: Record<string, unknown> = { updatedAt: new Date() };
  const settlementId = str(params.settlementID) ?? str(params.settlementId);
  const settlementStatus = str(params.settlementStatus);
  const settlementDate = str(params.settlementDate);

  if (settlementId) settlementFields["attempts.$.settlementId"] = settlementId;
  if (settlementStatus) settlementFields["attempts.$.settlementStatus"] = settlementStatus;
  if (settlementDate) {
    // Settlement dates arrive as YYYYMMDD, not the full YYYYMMDDHHMISS.
    const normalised = settlementDate.length === 8 ? `${settlementDate}000000` : settlementDate;
    const parsed = parseIciciDate(normalised);
    if (parsed) settlementFields["attempts.$.settlementDate"] = parsed;
  }

  const col = await paymentLinks();
  const res = await col.updateOne(
    { "attempts.merchantTxnNo": merchantTxnNo },
    { $set: settlementFields }
  );

  if (res.matchedCount === 0) {
    console.error("[icici/settlement] unknown transaction", { merchantTxnNo });
  }

  // Acknowledge regardless — the raw event is stored, and a retry cannot help.
  return NextResponse.json({ received: true, applied: res.matchedCount > 0 }, { status: 200 });
}
