import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * ICICI Orange PG secure hash (V1).
 *
 * These rules are VERIFIED against the UAT endpoint, not inferred from the spec —
 * ICICI's documented sample does not reproduce with our key and is internally
 * inconsistent. See docs/payments-tech-spec.md §10.2.
 *
 *   1. Drop secureHash / securehash.
 *   2. Drop null, undefined and empty-string values.
 *   3. Drop booleans entirely (a live response contains "oth_charge": false;
 *      including it as "false" produces a mismatch).
 *   4. Sort keys in ASCII / code-unit order — uppercase before lowercase. This is
 *      JavaScript's default .sort(). Confirmed via "TransmissionDateTime", which
 *      sorts before all lowercase keys. Case-insensitive sorting FAILS.
 *   5. Concatenate values only, no separator. HMAC-SHA256, hex, lowercase.
 */
export function buildHashInput(params: Record<string, unknown>): string {
  return Object.keys(params)
    .filter((k) => k !== "secureHash" && k !== "securehash")
    .filter((k) => {
      const v = params[k];
      if (v === null || v === undefined || v === "") return false;
      if (typeof v === "boolean") return false;
      return true;
    })
    .sort()
    .map((k) => String(params[k]))
    .join("");
}

export function computeHash(params: Record<string, unknown>, key: string): string {
  return createHmac("sha256", key)
    .update(buildHashInput(params), "utf8")
    .digest("hex")
    .toLowerCase();
}

/**
 * Verify an inbound callback. Hashes whatever actually arrived rather than a fixed
 * field list — the spec requires including parameters that are not in the published
 * spec, and their own Status Check response already contains four such fields.
 *
 * Note: hash the POST body ONLY. Per spec p.26, query parameters are excluded.
 */
export function verifyInboundHash(params: Record<string, unknown>, key: string): boolean {
  const received = params.secureHash ?? params.securehash;
  if (typeof received !== "string" || received.length === 0) return false;

  const a = Buffer.from(computeHash(params, key));
  const b = Buffer.from(received.toLowerCase());
  // timingSafeEqual throws on length mismatch, so guard before calling it.
  return a.length === b.length && timingSafeEqual(a, b);
}

export function merchantKey(): string {
  const key = process.env.ICICI_MERCHANT_KEY;
  if (!key) throw new Error("ICICI_MERCHANT_KEY is not set");
  return key.trim(); // copy-pasted keys often carry trailing whitespace
}
