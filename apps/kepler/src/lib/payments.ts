import { gatewayEvents, paymentLinks } from "./db";
import { amountStringToPaise, generateMerchantTxnNo } from "./icici/format";
import { isSuccessCode } from "./icici/client";
import type { AttemptStatus, PaymentAttempt, PaymentLink } from "./types";

/**
 * Callback payloads are untrusted. String(value) on an object yields the literal
 * "[object Object]", so only primitives are accepted — anything else is dropped
 * rather than silently stored as garbage.
 */
function str(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return undefined;
}

/**
 * Starts a payment attempt on a link.
 *
 * Status and expiry are enforced INSIDE the query filter, not by reading first. If the
 * link was paid, cancelled or expired a moment ago, the filter matches nothing and no
 * attempt is created — there is no read-then-write window to exploit.
 */
export async function startAttempt(
  token: string
): Promise<{ link: PaymentLink; merchantTxnNo: string } | { error: string }> {
  const col = await paymentLinks();
  const now = new Date();

  for (let tries = 0; tries < 3; tries++) {
    const merchantTxnNo = generateMerchantTxnNo();
    const attempt: PaymentAttempt = {
      merchantTxnNo,
      status: "pending",
      expectedAmountPaise: 0, // replaced below from the link's own amount
      createdAt: now,
      updatedAt: now,
    };

    // Read the link first only to learn the amount; the write below re-checks status.
    const link = await col.findOne({ token });
    if (!link) return { error: "not_found" };
    if (link.status === "paid") return { error: "already_paid" };
    if (link.status === "pending_approval") return { error: "awaiting_approval" };
    if (link.status !== "active") return { error: "unavailable" };
    if (link.expiresAt && link.expiresAt.getTime() <= now.getTime()) return { error: "expired" };

    attempt.expectedAmountPaise = link.amountPaise;

    const res = await col.findOneAndUpdate(
      {
        token,
        status: "active", // re-checked atomically
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
      },
      { $push: { attempts: attempt }, $set: { updatedAt: now } },
      { returnDocument: "after" }
    );

    if (res) return { link: res, merchantTxnNo };

    // No match: either the link changed state between the read and the write, or the
    // generated merchantTxnNo collided. Re-read to tell the two apart.
    const fresh = await col.findOne({ token });
    if (!fresh) return { error: "not_found" };
    if (fresh.status === "paid") return { error: "already_paid" };
    if (fresh.status !== "active") return { error: "unavailable" };
    // Still active — assume an ID collision and retry with a fresh one.
  }

  return { error: "could_not_start" };
}

export interface CallbackResult {
  applied: boolean;
  status: "paid" | "failed" | "reversed" | "unknown";
  linkToken?: string;
  reason?: string;
}

/**
 * Applies a payment result from any source (browser return, advice webhook, status
 * check). Safe to call repeatedly with the same payload — ICICI retries advice until
 * it gets a 200, and the browser return races the webhook.
 */
export async function applyPaymentResult(
  params: Record<string, unknown>,
  source: "return" | "advice" | "settlement" | "status_check",
  /**
   * Status Check reports the outcome in `txnStatus`, not `responseCode` — the latter
   * only says whether the query itself worked. Callers that already know the answer
   * pass it explicitly rather than letting this read the wrong field.
   */
  successOverride?: boolean
): Promise<CallbackResult> {
  const merchantTxnNo = str(params.merchantTxnNo) ?? "";
  if (!merchantTxnNo) return { applied: false, status: "unknown", reason: "no_merchant_txn_no" };

  // Record the raw callback before interpreting it. If a payment is ever disputed,
  // this is the only evidence that settles it.
  const events = await gatewayEvents();
  await events.insertOne({ merchantTxnNo, source, payload: params, receivedAt: new Date() });

  const col = await paymentLinks();
  const link = await col.findOne({ "attempts.merchantTxnNo": merchantTxnNo });
  if (!link) return { applied: false, status: "unknown", reason: "unknown_transaction" };

  const succeeded = successOverride ?? isSuccessCode(params.responseCode);
  const now = new Date();

  // Cross-check the amount against what we asked for. Never trust the callback's number.
  const attempt = link.attempts.find((a) => a.merchantTxnNo === merchantTxnNo);
  const amountStr = str(params.amount);
  const reportedPaise = amountStr ? amountStringToPaise(amountStr) : undefined;

  if (succeeded && attempt && reportedPaise !== undefined) {
    if (reportedPaise !== attempt.expectedAmountPaise) {
      // Do not mark paid. A mismatch means either a gateway problem or tampering;
      // either way a human needs to look before the booking is honoured.
      console.error(
        `[payments] AMOUNT MISMATCH on ${merchantTxnNo}: expected ${attempt.expectedAmountPaise}, reported ${reportedPaise}`
      );
      await col.updateOne(
        { "attempts.merchantTxnNo": merchantTxnNo },
        {
          $set: {
            "attempts.$.status": "failed",
            "attempts.$.paidAmountPaise": reportedPaise,
            "attempts.$.updatedAt": now,
            updatedAt: now,
          },
        }
      );
      return {
        applied: true,
        status: "failed",
        linkToken: link.token,
        reason: "amount_mismatch",
      };
    }
  }

  // A failure arriving for an attempt that ALREADY succeeded is a reversal, not a
  // decline. Chapter 8 exists precisely to report this — days later, potentially.
  const wasPaid = attempt?.status === "paid";
  let newAttemptStatus: AttemptStatus;
  if (succeeded) newAttemptStatus = "paid";
  else if (wasPaid) newAttemptStatus = "reversed";
  else newAttemptStatus = "failed";

  const attemptFields: Record<string, unknown> = {
    "attempts.$.status": newAttemptStatus,
    "attempts.$.updatedAt": now,
    updatedAt: now,
  };
  if (reportedPaise !== undefined) attemptFields["attempts.$.paidAmountPaise"] = reportedPaise;
  const txnId = str(params.txnID);
  if (txnId) attemptFields["attempts.$.txnId"] = txnId;
  const mode = str(params.paymentMode);
  if (mode) attemptFields["attempts.$.paymentMode"] = mode;
  const payDate = str(params.paymentDateTime);
  if (payDate) attemptFields["attempts.$.paymentDateTime"] = parseIciciDate(payDate);

  await col.updateOne({ "attempts.merchantTxnNo": merchantTxnNo }, { $set: attemptFields });

  if (!succeeded && wasPaid) {
    console.error(
      `[payments] REVERSAL on ${merchantTxnNo} (link ${link.token}) — a confirmed payment is no longer paid`
    );
  }

  // Derive the link's status from its attempts rather than setting it inline. That
  // way a reversal demotes the link automatically, and replaying any callback lands
  // on the same answer.
  await recomputeLinkStatus(merchantTxnNo, now);

  return {
    applied: true,
    status: newAttemptStatus === "paid" ? "paid" : newAttemptStatus,
    linkToken: link.token,
  };
}

/**
 * A link is paid if any of its attempts is paid. If a reversal removes the last paid
 * attempt, the link falls back to active (or expired, if its window has closed) so
 * the customer can pay again and staff can see the truth.
 */
async function recomputeLinkStatus(merchantTxnNo: string, now: Date): Promise<void> {
  const col = await paymentLinks();
  const link = await col.findOne({ "attempts.merchantTxnNo": merchantTxnNo });
  if (!link) return;

  // Never resurrect a link a human deliberately killed. But money may genuinely have
  // arrived against it — the customer can be mid-payment when staff hit cancel — so
  // shout about it. Otherwise the payment is invisible: the UI just says "cancelled"
  // while the money sits in the merchant account awaiting a refund.
  if (link.status === "cancelled" || link.status === "rejected") {
    if (link.attempts.some((a) => a.status === "paid")) {
      console.error(
        `[payments] PAYMENT ON ${link.status.toUpperCase()} LINK — ${link.token} received money ` +
          `(${merchantTxnNo}). This needs a refund or manual reconciliation.`
      );
    }
    return;
  }

  const hasPaid = link.attempts.some((a) => a.status === "paid");

  if (hasPaid) {
    if (link.status !== "paid") {
      await col.updateOne(
        { _id: link._id },
        { $set: { status: "paid", paidAt: now, updatedAt: now } }
      );
    }
    return;
  }

  const expired = !!link.expiresAt && link.expiresAt.getTime() <= now.getTime();
  const next = expired ? "expired" : "active";
  if (link.status !== next) {
    await col.updateOne(
      { _id: link._id },
      { $set: { status: next, updatedAt: now }, $unset: { paidAt: "" } }
    );
  }
}

/** ICICI sends YYYYMMDDHHMISS in IST. */
export function parseIciciDate(value: string): Date | undefined {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(value);
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s] = m;
  // IST is UTC+5:30 and has no daylight saving, so a fixed offset is safe.
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+05:30`);
}
