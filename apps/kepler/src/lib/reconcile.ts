import { paymentLinks } from "./db";
import { checkStatus } from "./icici/client";
import { applyPaymentResult } from "./payments";

/** Attempts younger than this are still plausibly in flight — leave them alone. */
const STALE_AFTER_MINUTES = 15;

/** After this long with no resolution, stop asking and mark the attempt expired. */
const GIVE_UP_AFTER_HOURS = 24;

/** Bound the work per run so a backlog cannot exhaust the function's time limit. */
const MAX_CHECKS_PER_RUN = 25;

export interface ReconcileReport {
  expiredLinks: number;
  checked: number;
  resolvedPaid: number;
  resolvedFailed: number;
  stillPending: number;
  gaveUp: number;
  errors: string[];
}

/**
 * Marks links whose payment window has closed. Purely cosmetic correctness — the pay
 * page already refuses an expired link on its own — but it keeps the dashboard honest
 * and stops stale rows accumulating as "awaiting payment" forever.
 */
export async function expireStaleLinks(now = new Date()): Promise<number> {
  const col = await paymentLinks();
  const res = await col.updateMany(
    { status: "active", expiresAt: { $lte: now } },
    { $set: { status: "expired", updatedAt: now } }
  );
  return res.modifiedCount;
}

/**
 * Chases attempts stuck in `pending`.
 *
 * A customer who closes their browser mid-payment leaves an attempt pending forever:
 * the browser return never fires, and if the advice webhook is missed or not yet
 * registered, nothing else resolves it. Without this, a real payment can sit
 * invisible — the customer is charged and the restaurant never knows.
 */
export async function reconcilePendingAttempts(now = new Date()): Promise<ReconcileReport> {
  const report: ReconcileReport = {
    expiredLinks: 0,
    checked: 0,
    resolvedPaid: 0,
    resolvedFailed: 0,
    stillPending: 0,
    gaveUp: 0,
    errors: [],
  };

  const col = await paymentLinks();
  const staleBefore = new Date(now.getTime() - STALE_AFTER_MINUTES * 60_000);
  const giveUpBefore = new Date(now.getTime() - GIVE_UP_AFTER_HOURS * 3_600_000);

  const links = await col
    .find({ "attempts.status": "pending", "attempts.createdAt": { $lte: staleBefore } })
    .limit(MAX_CHECKS_PER_RUN)
    .toArray();

  for (const link of links) {
    for (const attempt of link.attempts) {
      if (attempt.status !== "pending") continue;
      if (attempt.createdAt > staleBefore) continue;

      // Too old to still be in flight, and the gateway never told us anything.
      if (attempt.createdAt <= giveUpBefore) {
        await col.updateOne(
          { "attempts.merchantTxnNo": attempt.merchantTxnNo },
          { $set: { "attempts.$.status": "expired", "attempts.$.updatedAt": now } }
        );
        report.gaveUp++;
        continue;
      }

      report.checked++;
      const status = await checkStatus(attempt.merchantTxnNo);

      if (!status.ok) {
        // The query itself failed — we learned nothing. Leave it pending and retry
        // next run rather than guessing.
        report.errors.push(`${attempt.merchantTxnNo}: ${status.message ?? "query failed"}`);
        report.stillPending++;
        continue;
      }

      // txnStatus is the payment outcome. responseCode only covered the query.
      if (status.txnStatus === "REQ") {
        report.stillPending++;
        continue;
      }

      if (status.txnStatus === "SUC") {
        await applyPaymentResult(status.raw, "status_check", true);
        report.resolvedPaid++;
        console.warn(
          `[reconcile] recovered a PAID payment that no callback reported: ${attempt.merchantTxnNo}`
        );
        continue;
      }

      // REJ or ERR — a real, final failure.
      await applyPaymentResult(status.raw, "status_check", false);
      report.resolvedFailed++;
    }
  }

  return report;
}

export async function runReconciliation(now = new Date()): Promise<ReconcileReport> {
  const report = await reconcilePendingAttempts(now);
  // Expire AFTER reconciling, so an attempt that just resolved to paid still promotes
  // its link before the link is considered for expiry.
  report.expiredLinks = await expireStaleLinks(now);
  return report;
}
