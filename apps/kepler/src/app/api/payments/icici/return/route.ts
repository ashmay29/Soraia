import { NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/config";
import { merchantKey, verifyInboundHash } from "@/lib/icici/hash";
import { applyPaymentResult } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ICICI posts the customer's BROWSER here as a form POST after payment.
 *
 * This exists so the customer sees a result immediately. The advice webhook is the
 * actual source of truth — a customer can close their browser mid-payment, in which
 * case this never fires and only the webhook does.
 */
export async function POST(req: Request) {
  const body = await req.text();
  // Hash the POST body ONLY. Per spec p.26, query parameters are excluded from the
  // secureHash calculation.
  const params = Object.fromEntries(new URLSearchParams(body)) as Record<string, unknown>;

  const redirect = (path: string) =>
    // 303 so the browser issues a GET for the result page rather than re-POSTing.
    NextResponse.redirect(`${appBaseUrl()}${path}`, 303);

  if (!verifyInboundHash(params, merchantKey())) {
    console.error("[icici/return] signature verification FAILED", { body });
    return redirect("/pay/invalid");
  }

  const result = await applyPaymentResult(params, "return");

  if (!result.linkToken) {
    console.error("[icici/return] no matching transaction", { params });
    return redirect("/pay/invalid");
  }

  return redirect(`/pay/${result.linkToken}/result`);
}

/** ICICI should POST here; a GET means someone opened the URL directly. */
export async function GET() {
  return NextResponse.redirect(`${appBaseUrl()}/pay/invalid`, 303);
}
