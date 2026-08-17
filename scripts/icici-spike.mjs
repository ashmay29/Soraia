#!/usr/bin/env node
/**
 * ICICI Orange PG — UAT hash spike.
 *
 * Purpose: prove that our secureHash implementation is accepted by ICICI's UAT
 * endpoint. This is step 1 of the build — nothing else in the payment flow is
 * worth writing until this returns responseCode R1000.
 *
 * Why this exists: the sample secureHash in ICICI's own documentation does not
 * reproduce with our UAT key, and their sample is internally inconsistent. So the
 * hash cannot be validated offline. It has to be proven against the live endpoint.
 *
 * Usage:
 *   node --env-file=.env.local scripts/icici-spike.mjs sale            # ₹100 default
 *   node --env-file=.env.local scripts/icici-spike.mjs sale 2500       # ₹2500.00
 *   node --env-file=.env.local scripts/icici-spike.mjs sale 999.50 --accent
 *   node --env-file=.env.local scripts/icici-spike.mjs status <merchantTxnNo> <txnID>
 *
 * Requires: ICICI_MERCHANT_ID, ICICI_AGGREGATOR_ID, ICICI_MERCHANT_KEY
 * Node 20.6+ for --env-file, or just export the vars yourself.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// ── config ────────────────────────────────────────────────────────────────────

const BASE = process.env.ICICI_BASE_URL ?? "https://pgpayuat.icicibank.com/tsp/pg/api";
const MERCHANT_ID = requireEnv("ICICI_MERCHANT_ID");
const AGGREGATOR_ID = requireEnv("ICICI_AGGREGATOR_ID");
const KEY = requireEnv("ICICI_MERCHANT_KEY").trim(); // trim: copy-paste often carries whitespace

// The spike does not need our own infrastructure. Defaults to ICICI's own sample
// return URL so this runs before anything is deployed.
const RETURN_URL =
  process.env.ICICI_RETURN_URL ?? "https://pgpayuat.icicibank.com/tsp/pg/api/merchant";

/** fetch, but a network/TLS failure prints guidance instead of an undici stack trace. */
async function post(url, headers, body) {
  try {
    return await fetch(url, { method: "POST", headers, body });
  } catch (err) {
    console.log(`\n  ✗ Could not reach ${url}`);
    console.log(`    ${err.cause?.message ?? err.message}`);
    console.log("\n    Network-level failure — the request never reached ICICI.");
    console.log("    Check connectivity, ICICI_BASE_URL, and whether UAT requires");
    console.log("    your outbound IP to be whitelisted.");
    process.exit(1);
  }
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env var: ${name}`);
    console.error("Try: node --env-file=.env.local scripts/icici-spike.mjs sale");
    process.exit(1);
  }
  return v;
}

// ── hash (V1) ─────────────────────────────────────────────────────────────────
// Sort params by NAME ascending, concatenate VALUES only (no separator),
// HMAC-SHA256 with the merchant key, hex, lowercase.
// Skip only null/empty values — including fields not in the published spec.

function v1Hash(params, key) {
  const input = Object.keys(params)
    .filter((k) => k !== "secureHash" && k !== "securehash")
    .filter((k) => params[k] !== null && params[k] !== undefined && params[k] !== "")
    .filter((k) => typeof params[k] !== "boolean")
    // Plain .sort() is ASCII/code-unit order — uppercase before lowercase. This is
    // the correct behaviour: confirmed via "TransmissionDateTime" in a live response.
    .sort()
    .map((k) => String(params[k]))
    .join("");

  // Keep this visible. If we end up on a call with ICICI, this exact string is
  // what lets them point at the wrong field in one reply.
  console.log("\n  hash input (between the arrows, no spaces added):");
  console.log(`  → ${input} ←`);

  return createHmac("sha256", key).update(input, "utf8").digest("hex").toLowerCase();
}

function verifyHash(params, key) {
  const received = params.secureHash ?? params.securehash;
  if (!received) return { ok: false, reason: "no secureHash in response" };

  const rest = {};
  for (const [k, v] of Object.entries(params)) {
    if (k === "secureHash" || k === "securehash") continue;
    if (v === null || v === undefined || v === "") continue;
    // Booleans are EXCLUDED from the hash — confirmed empirically against a live
    // Status Check response containing "oth_charge": false. Including it as the
    // string "false" produces a mismatch.
    if (typeof v === "boolean") continue;
    rest[k] = String(v);
  }

  const computed = createHmac("sha256", key)
    .update(
      Object.keys(rest)
        .sort()
        .map((k) => rest[k])
        .join(""),
      "utf8"
    )
    .digest("hex")
    .toLowerCase();

  const a = Buffer.from(computed);
  const b = Buffer.from(String(received).toLowerCase());
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, computed, received, reason: ok ? null : "mismatch" };
}

// ── merchantTxnNo ─────────────────────────────────────────────────────────────
// Max 20 chars, alphanumeric only. Over 20 and QR generation silently breaks.

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function generateMerchantTxnNo(prefix = "SOR") {
  const ts = Date.now().toString(36);
  const bytes = randomBytes(8);
  let rand = "";
  for (let i = 0; i < bytes.length; i++) rand += ALPHABET[bytes[i] % 36];

  const id = `${prefix}${ts}${rand}`;
  if (id.length > 20 || !/^[A-Za-z0-9]+$/.test(id)) {
    throw new Error(`Invalid merchantTxnNo: ${id} (len ${id.length})`);
  }
  return id;
}

function txnDateIST(d = new Date()) {
  // YYYYMMDDHHMISS in Asia/Kolkata
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(d)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

// ── initiate sale ─────────────────────────────────────────────────────────────

async function runSale({ accent, amount }) {
  const merchantTxnNo = generateMerchantTxnNo();

  // --accent tests whether non-ASCII names break the hash. ICICI's Java sample
  // hashes with getBytes("ASCII") while keying UTF-8, so this may well fail.
  const customerName = accent ? "José Ferreira" : "Test Customer";

  const req = {
    merchantId: MERCHANT_ID,
    aggregatorID: AGGREGATOR_ID,
    merchantTxnNo,
    amount, // always two decimals — see parseAmount()
    currencyCode: "356",
    payType: "0", // Standard / redirect
    transactionType: "SALE",
    customerEmailID: "test@soraia.in",
    customerMobileNo: "9876543210",
    customerName,
    returnURL: RETURN_URL,
    txnDate: txnDateIST(),
  };

  req.secureHash = v1Hash(req, KEY);

  console.log(`\n  amount:        ₹${amount}`);
  console.log(`  merchantTxnNo: ${merchantTxnNo} (${merchantTxnNo.length} chars)`);
  console.log(`  customerName:  ${customerName}${accent ? "   ← non-ASCII test" : ""}`);
  console.log(`  secureHash:    ${req.secureHash}`);

  const url = `${BASE}/v2/initiateSale`;
  console.log(`\n  POST ${url}`);

  const res = await post(url, { "Content-Type": "application/json" }, JSON.stringify(req));

  const text = await res.text();
  console.log(`  HTTP ${res.status}\n`);

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    console.log("  Response was not JSON:\n");
    console.log(text);
    return fail("Could not parse response.");
  }

  console.log("  response:", JSON.stringify(body, null, 2).replace(/\n/g, "\n  "));

  if (body.responseCode !== "R1000") {
    return fail(
      `responseCode was ${body.responseCode} — expected R1000.\n` +
        `  ${body.responseDescription ?? body.respDescription ?? ""}`
    );
  }

  // Our hash was accepted. Now check we can verify theirs.
  const check = verifyHash(body, KEY);
  console.log(`\n  response hash verification: ${check.ok ? "PASS" : "FAIL"}`);
  if (!check.ok) {
    console.log(`    computed: ${check.computed}`);
    console.log(`    received: ${check.received}`);
    console.log("    → outbound hash works but inbound verification does not.");
    console.log("      Callback handlers would reject every ICICI response. Fix before §7.");
  }

  console.log("\n  ✓ SUCCESS — ICICI accepted our secureHash.");
  console.log("\n  Open this to complete a test payment in the browser:");
  console.log(`  ${body.redirectURI}?tranCtx=${body.tranCtx}`);
  console.log("\n  Test card 4761 3400 0000 0035 · exp 07/26 · CVV 123 · OTP 123456");
  console.log("  UPI test@ybl · Netbanking: CC Avenue Test Bank");

  if (!process.env.ICICI_RETURN_URL) {
    console.log("\n  ⚠ returnURL is ICICI's sample endpoint, not ours.");
    console.log("    After paying you WILL see a signature error on their page.");
    console.log("    That is expected — their demo receiver cannot validate a hash");
    console.log("    signed with our key. It does not mean the payment failed.");
    console.log("    Confirm the real outcome with the status command below.");
  }

  console.log(`\n  Then check the real outcome:`);
  console.log(`  node --env-file=.env.local scripts/icici-spike.mjs status ${merchantTxnNo}`);
}

// ── status check ──────────────────────────────────────────────────────────────
// Different shape to initiateSale: form-urlencoded, not JSON.

async function runStatus(merchantTxnNo, originalTxnNo) {
  if (!merchantTxnNo) {
    return fail("Usage: icici-spike.mjs status <merchantTxnNo> [txnID]");
  }

  // Spec 12.1 says merchantTxnNo should be "Same as originalTxnNo", but their own
  // cURL sample sends two different values. Defaulting to the same value tests the
  // documented behaviour — and answers open question 4 to ICICI either way.
  if (!originalTxnNo) {
    originalTxnNo = merchantTxnNo;
    console.log("\n  (no txnID given — using merchantTxnNo for originalTxnNo, per spec 12.1)");
  }

  const req = {
    merchantId: MERCHANT_ID,
    aggregatorID: AGGREGATOR_ID,
    merchantTxnNo,
    originalTxnNo,
    transactionType: "STATUS",
  };
  req.secureHash = v1Hash(req, KEY);

  const url = `${BASE}/command`;
  console.log(`\n  POST ${url}  (form-urlencoded)`);

  const res = await post(
    url,
    { "Content-Type": "application/x-www-form-urlencoded" },
    new URLSearchParams(req).toString()
  );

  const text = await res.text();
  console.log(`  HTTP ${res.status}\n`);

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    console.log(text);
    return fail("Could not parse response.");
  }

  console.log("  response:", JSON.stringify(body, null, 2).replace(/\n/g, "\n  "));

  const check = verifyHash(body, KEY);
  console.log(`\n  response hash verification: ${check.ok ? "PASS" : "FAIL"}`);
  if (!check.ok) {
    console.log(`    computed: ${check.computed}`);
    console.log(`    received: ${check.received}`);
    // This response contains oth_charge as a JSON boolean. If verification fails
    // here but passed on initiateSale, boolean coercion is the likely cause —
    // that is open question 2 to ICICI.
    if ("oth_charge" in body) {
      console.log("    → note: response contains oth_charge (boolean).");
      console.log("      Try excluding it, or coercing false → '' rather than 'false'.");
    }
  }

  // The payment result is txnStatus, NOT responseCode.
  // responseCode only says whether the STATUS QUERY succeeded.
  console.log("\n  ── payment outcome ──");
  console.log(`  responseCode:    ${body.responseCode}   (was the query OK — not the payment)`);
  console.log(`  txnStatus:       ${body.txnStatus}   ← the actual payment result`);
  console.log(`  txnResponseCode: ${body.txnResponseCode}`);
  console.log(`  amount:          ${body.amount}`);
  console.log(
    {
      SUC: "  → paid",
      REQ: "  → still in process. Do NOT mark failed; leave pending.",
      REJ: "  → rejected",
      ERR: "  → error during processing",
    }[body.txnStatus] ?? "  → unknown txnStatus"
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

function fail(msg) {
  console.log(`\n  ✗ FAILED — ${msg}`);
  console.log("\n  Check in this order:");
  console.log("    1. amount is exactly two decimals: '100.00', never '100'");
  console.log("    2. key has no stray whitespace (we .trim() it — check the env value)");
  console.log("    3. empty fields are omitted entirely, not sent as ''");
  console.log("    4. non-ASCII in customerName — rerun with --accent to compare");
  console.log("    5. merchantTxnNo ≤ 20 chars, alphanumeric only");
  console.log("\n  Still failing? Send ICICI the hash input string printed above.");
  process.exitCode = 1;
}

/**
 * ICICI wants 9 significant digits and exactly 2 decimals. "100" or "100.0" would
 * change the hash input and be rejected, so normalise here rather than trusting
 * whatever was typed on the command line.
 */
function parseAmount(raw) {
  if (raw === undefined) return "100.00";
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    console.error(`\n  Invalid amount: '${raw}'. Use a positive number, e.g. 250 or 250.50`);
    process.exit(1);
  }
  if (n > 999999999) {
    console.error(`\n  Amount too large: max 9 digits before the decimal.`);
    process.exit(1);
  }
  return n.toFixed(2);
}

const [, , cmd = "sale", ...rest] = process.argv;
const accent = rest.includes("--accent");
// Only the 'sale' command takes an amount — for 'status' the positional args are
// transaction references and must not be parsed as numbers.
const amount = cmd === "sale" ? parseAmount(rest.find((a) => !a.startsWith("--"))) : null;

console.log("\nICICI Orange PG — UAT spike");
console.log(`  MID ${MERCHANT_ID} · agg ${AGGREGATOR_ID} · key ${KEY.slice(0, 4)}…${KEY.slice(-4)}`);

if (cmd === "sale") {
  await runSale({ accent, amount });
} else if (cmd === "status") {
  await runStatus(rest[0], rest[1]);
} else {
  fail(`Unknown command '${cmd}'. Use 'sale' or 'status'.`);
}
