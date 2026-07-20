import { afterAll, describe, expect, it } from "vitest";
import { paymentLinks, gatewayEvents, getClient } from "./db";
import { applyPaymentResult } from "./payments";

/**
 * Hits a real MongoDB. Skipped automatically when MONGODB_URI is absent, so unit
 * runs and CI without a database stay green.
 */
const hasDb = !!process.env.MONGODB_URI;
const TOKEN = "vitest-recovery-token";
const TXN = "SORvitestrecover001";

describe.skipIf(!hasDb)("lost payment recovery via status check", () => {
  afterAll(async () => {
    const col = await paymentLinks();
    await col.deleteMany({ token: TOKEN });
    const ev = await gatewayEvents();
    await ev.deleteMany({ merchantTxnNo: TXN });
    await (await getClient()).close();
  });

  it("marks a link paid when Status Check reports SUC and no callback ever arrived", async () => {
    const col = await paymentLinks();
    await col.deleteMany({ token: TOKEN });
    await col.insertOne({
      token: TOKEN,
      amountPaise: 450000,
      description: "vitest recovery",
      customer: {},
      status: "active",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdBy: null as any,
      expiresAt: new Date(Date.now() + 3_600_000),
      attempts: [
        {
          merchantTxnNo: TXN,
          status: "pending",
          expectedAmountPaise: 450000,
          createdAt: new Date(Date.now() - 30 * 60_000),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // The exact shape of a real Status Check SUC response. responseCode "000" refers
    // to the QUERY; txnStatus "SUC" is the payment outcome — hence the explicit
    // success override rather than letting responseCode decide.
    const result = await applyPaymentResult(
      {
        responseCode: "000",
        txnStatus: "SUC",
        txnResponseCode: "0000",
        merchantTxnNo: TXN,
        amount: "4500.00",
        txnID: "7700277777003",
        paymentMode: "UPI",
        paymentDateTime: "20260721030000",
        oth_charge: false,
      },
      "status_check",
      true
    );

    expect(result.status).toBe("paid");

    const after = await col.findOne({ token: TOKEN });
    expect(after?.status).toBe("paid");
    expect(after?.attempts[0].status).toBe("paid");
    expect(after?.attempts[0].paidAmountPaise).toBe(450000);
    expect(after?.attempts[0].txnId).toBe("7700277777003");
  });

  it("refuses to recover when Status Check reports a different amount", async () => {
    const col = await paymentLinks();
    await col.updateOne(
      { token: TOKEN },
      { $set: { status: "active", "attempts.0.status": "pending" }, $unset: { paidAt: "" } }
    );

    const result = await applyPaymentResult(
      { responseCode: "000", txnStatus: "SUC", merchantTxnNo: TXN, amount: "1.00" },
      "status_check",
      true
    );

    expect(result.reason).toBe("amount_mismatch");
    const after = await col.findOne({ token: TOKEN });
    expect(after?.status).not.toBe("paid");
  });
});
