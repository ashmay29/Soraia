import { describe, expect, it } from "vitest";
import { buildHashInput, computeHash, verifyInboundHash } from "./hash";
import {
  generateLinkToken,
  generateMerchantTxnNo,
  paiseToAmountString,
  sanitizeForIcici,
  txnDateIST,
} from "./format";

/**
 * The hash rules here were established empirically against ICICI's UAT endpoint
 * (see docs/payments-tech-spec.md §10.2). ICICI's documented sample does NOT
 * reproduce, so these tests encode observed behaviour — they are the only thing
 * standing between a refactor and every payment callback silently failing.
 */
describe("secure hash", () => {
  it("sorts keys in ASCII order — uppercase before lowercase", () => {
    // The real trap: a live Status Check response contains "TransmissionDateTime",
    // which must sort BEFORE all lowercase keys. Case-insensitive sorting fails.
    const input = buildHashInput({ zebra: "Z", TransmissionDateTime: "T", apple: "A" });
    expect(input).toBe("TAZ");
  });

  it("excludes booleans entirely, not as the string 'false'", () => {
    // Verified against a live response containing "oth_charge": false.
    expect(buildHashInput({ a: "1", oth_charge: false, b: "2" })).toBe("12");
    expect(buildHashInput({ a: "1", flag: true, b: "2" })).toBe("12");
  });

  it("excludes null, undefined and empty strings", () => {
    expect(buildHashInput({ a: "1", b: null, c: undefined, d: "", e: "2" })).toBe("12");
  });

  it("excludes the hash field itself, in either casing", () => {
    expect(buildHashInput({ a: "1", secureHash: "xx", securehash: "yy" })).toBe("1");
  });

  it("includes fields absent from the published spec", () => {
    // ICICI's own Status Check response carries four undocumented fields. Hashing a
    // hardcoded field list would already be broken today.
    expect(buildHashInput({ a: "1", undocumentedField: "2" })).toBe("12");
  });

  it("concatenates values with no separator and lowercases the digest", () => {
    const hash = computeHash({ b: "world", a: "hello" }, "key");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(computeHash({ helloworld: "" }, "key")).not.toBe(hash);
  });

  it("round-trips: a computed hash verifies", () => {
    const params: Record<string, unknown> = { merchantId: "123", amount: "100.00" };
    params.secureHash = computeHash(params, "secret");
    expect(verifyInboundHash(params, "secret")).toBe(true);
  });

  it("rejects a tampered amount", () => {
    const params: Record<string, unknown> = { merchantId: "123", amount: "100.00" };
    params.secureHash = computeHash(params, "secret");
    params.amount = "1.00";
    expect(verifyInboundHash(params, "secret")).toBe(false);
  });

  it("rejects the wrong key, a missing hash, and a length mismatch", () => {
    const params: Record<string, unknown> = { merchantId: "123" };
    params.secureHash = computeHash(params, "secret");
    expect(verifyInboundHash(params, "wrong-key")).toBe(false);
    expect(verifyInboundHash({ merchantId: "123" }, "secret")).toBe(false);
    // Must not throw — timingSafeEqual would, on unequal lengths.
    expect(verifyInboundHash({ merchantId: "123", secureHash: "abc" }, "secret")).toBe(false);
  });
});

describe("merchantTxnNo", () => {
  it("stays within ICICI's 20-char alphanumeric limit", () => {
    for (let i = 0; i < 500; i++) {
      const id = generateMerchantTxnNo();
      expect(id.length).toBeLessThanOrEqual(20);
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    }
  });

  it("does not collide across rapid generation", () => {
    const ids = new Set(Array.from({ length: 5000 }, () => generateMerchantTxnNo()));
    expect(ids.size).toBe(5000);
  });

  it("throws rather than silently emitting an over-long id", () => {
    expect(() => generateMerchantTxnNo("MUCH-TOO-LONG-PREFIX")).toThrow();
  });
});

describe("link token", () => {
  it("is long and URL-safe — it is the only guard on the pay page", () => {
    const token = generateLinkToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("sanitizeForIcici", () => {
  // Every case below was verified against the live UAT endpoint.
  it("strips accents to base letters", () => {
    expect(sanitizeForIcici("José Ferreira")).toBe("Jose Ferreira");
    expect(sanitizeForIcici("Zoë Müller")).toBe("Zoe Muller");
  });

  it("removes characters ICICI rejects outright", () => {
    expect(sanitizeForIcici("O'Brien")).toBe("OBrien");
    expect(sanitizeForIcici("Priya & Sons")).toBe("Priya Sons");
  });

  it("preserves hyphens and periods, which ICICI accepts", () => {
    expect(sanitizeForIcici("Anne-Marie OBrien")).toBe("Anne-Marie OBrien");
    expect(sanitizeForIcici("Ravi Kumar Jr.")).toBe("Ravi Kumar Jr.");
  });

  it("collapses whitespace and truncates to the field limit", () => {
    expect(sanitizeForIcici("  spaced   out  ")).toBe("spaced out");
    expect(sanitizeForIcici("a".repeat(100)).length).toBe(45);
  });

  it("only ever emits characters ICICI accepts", () => {
    expect(sanitizeForIcici('Ravi @#$%^*()+={}[]|\\:;"<>?/~`')).toMatch(/^[A-Za-z0-9 .-]*$/);
  });
});

describe("amount formatting", () => {
  it("always emits exactly two decimals", () => {
    expect(paiseToAmountString(10000)).toBe("100.00");
    expect(paiseToAmountString(99950)).toBe("999.50");
    expect(paiseToAmountString(1)).toBe("0.01");
    expect(paiseToAmountString(5000000)).toBe("50000.00");
  });

  it("refuses non-integer or non-positive paise", () => {
    expect(() => paiseToAmountString(100.5)).toThrow();
    expect(() => paiseToAmountString(0)).toThrow();
    expect(() => paiseToAmountString(-100)).toThrow();
  });
});

describe("txnDateIST", () => {
  it("formats as YYYYMMDDHHMISS in IST", () => {
    // 2026-07-20T12:00:00Z is 17:30 IST the same day.
    expect(txnDateIST(new Date("2026-07-20T12:00:00Z"))).toBe("20260720173000");
  });

  it("rolls the date over correctly near midnight IST", () => {
    // 2026-07-20T19:00:00Z is 00:30 IST on the 21st.
    expect(txnDateIST(new Date("2026-07-20T19:00:00Z"))).toBe("20260721003000");
  });
});
