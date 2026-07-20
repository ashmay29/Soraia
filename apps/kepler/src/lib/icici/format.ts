import { randomBytes } from "node:crypto";

const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * ICICI limit: 20 characters, alphanumeric only. Over 20 and QR generation silently
 * breaks. This rules out UUIDs (36, dashed) and Mongo ObjectIds (24 hex) — hence a
 * dedicated generator rather than reusing _id.
 *
 * Time-ordered so records sort naturally next to ICICI's dashboard.
 * Modulo bias is irrelevant: uniqueness is enforced by the unique index, with a
 * retry on duplicate-key error 11000.
 */
export function generateMerchantTxnNo(prefix = "SOR"): string {
  const ts = Date.now().toString(36); // 8 chars until ~2059
  const bytes = randomBytes(8);
  let rand = "";
  for (let i = 0; i < bytes.length; i++) rand += BASE36[bytes[i] % 36];

  const id = `${prefix}${ts}${rand}`; // 3 + 8 + 8 = 19
  if (id.length > 20 || !/^[A-Za-z0-9]+$/.test(id)) {
    throw new Error(`Invalid merchantTxnNo: ${id} (length ${id.length})`);
  }
  return id;
}

/** Public link token. Not the merchantTxnNo — this one has no length limit, so make it long. */
export function generateLinkToken(): string {
  return randomBytes(24).toString("base64url"); // 32 chars, URL-safe
}

/**
 * ICICI validates customerName against an undisclosed regex and rejects the whole
 * request for characters outside it. Verified against UAT:
 *   "Anne-Marie OBrien" ✅   "Ravi Kumar Jr." ✅
 *   "O'Brien" ❌   "Priya & Sons" ❌   "José Ferreira" ❌
 *
 * Both O'Brien and José are ordinary names, so sanitising is not optional. The real
 * name is stored in Mongo untouched — this is only ICICI's copy.
 */
export function sanitizeForIcici(raw: string, maxLength = 45): string {
  return raw
    .normalize("NFD") // split accents from their base letters
    .replace(/[\u0300-\u036f]/g, "") // José -> Jose
    .replace(/[^A-Za-z0-9 .-]/g, "") // drop apostrophes, ampersands, etc.
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** ICICI requires exactly two decimals. "100" or "100.0" changes the hash and is rejected. */
export function paiseToAmountString(paise: number): string {
  if (!Number.isInteger(paise) || paise <= 0) {
    throw new Error(`Amount must be a positive integer in paise, got ${paise}`);
  }
  return (paise / 100).toFixed(2);
}

export function amountStringToPaise(amount: string): number {
  return Math.round(Number(amount) * 100);
}

/** txnDate as YYYYMMDDHHMISS in Asia/Kolkata. IST confirmed accepted by UAT. */
export function txnDateIST(d = new Date()): string {
  const p = new Intl.DateTimeFormat("en-CA", {
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
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});

  return `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;
}
