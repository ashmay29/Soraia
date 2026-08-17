# Staff Payment Links — Tech Spec

ICICI "Orange PG" integration for Soraia. Staff-initiated payment links.

---

## 1. What we're building

An internal tool. A staff member logs in, enters an amount and a note, and gets a link.
They send that link to the customer over WhatsApp. The customer opens it, pays on ICICI's
hosted page, and both sides see the result.

**No public booking form.** Reservations continue to happen over WhatsApp and phone as they
do today — this only adds a way to take money in that conversation.

Payment links over **₹50,000** cannot be paid until the admin approves them.

## 2. Roles

| Role  | Count | Can do                                                                                  |
| ----- | ----- | --------------------------------------------------------------------------------------- |
| Staff | 2     | Create payment links, view and cancel **their own**, copy/share link                    |
| Admin | 1     | Everything staff can, plus: approve/reject >₹50k links, view **all** links and payments |

Email + password only. No self-signup — the three accounts are seeded. Separate accounts
(not a shared login) so every link is attributable to a person, which matters because
anyone with access can request money in the restaurant's name.

## 3. Tech stack

| Layer            | Choice                                     | Notes                                          |
| ---------------- | ------------------------------------------ | ---------------------------------------------- |
| App              | Next.js 16 App Router, React 19, TS strict | Existing `apps/kepler`                         |
| Server           | Route Handlers, `runtime = "nodejs"`       | Needs `node:crypto` + DB driver                |
| Auth             | Auth.js v5, Credentials provider           | Handles session cookies, CSRF. Don't hand-roll |
| Password hashing | `bcryptjs` (or `@node-rs/argon2`)          | Never store plaintext                          |
| Database         | **MongoDB Atlas**                          | See §4                                         |
| DB access        | Official `mongodb` Node driver             | Mongoose schemas would duplicate Zod — skip it |
| Validation       | Zod                                        | All untrusted input                            |
| Hashing (ICICI)  | `node:crypto`                              | No dependency needed                           |
| Email            | Resend                                     | Admin approval alerts                          |
| Tests            | Vitest                                     | None configured today; needed for hash logic   |
| Hosting          | Vercel — `soraia.in`, `uat.soraia.in`      |                                                |
| Cron             | Vercel Cron                                | Expire links, reconcile stuck payments         |

`apps/recipe` (FastAPI demo) is not used.

## 4. MongoDB

Since there's no capacity logic and no booking form, the relational pull is weak. Mongo also
buys one concrete advantage here: **payment attempts are embedded in the link document**, so
"mark this attempt paid AND mark the link paid" is a single atomic document update. In
Postgres that's two rows and a transaction. Given the callback path is the race-prone part of
this system (§11), removing the multi-document write is a real simplification.

Application code enforces what `CHECK` constraints would have. Validate with Zod at every
write — that discipline is not optional here.

## 5. Data model

Three collections: `users`, `paymentLinks`, `gatewayEvents`.

```ts
// users
{
  _id:          ObjectId,
  email:        string,   // unique index, lowercased
  passwordHash: string,
  name:         string,
  role:         "staff" | "admin",
  isActive:     boolean,
  createdAt:    Date,
}

// paymentLinks — attempts embedded
{
  _id:          ObjectId,
  token:        string,   // unique index — the public URL secret, 32 chars
  amountPaise:  number,   // integer paise, > 0
  description:  string,   // "Table for 4, Sat 8pm"

  customer: { name?: string, phone?: string, email?: string },  // ICICI mails a receipt

  status: "pending_approval" | "active" | "rejected" | "paid" | "expired" | "cancelled",

  createdBy:       ObjectId,   // → users
  approvedBy?:     ObjectId,
  approvedAt?:     Date,
  rejectedReason?: string,
  expiresAt?:      Date,       // set when the link becomes active
  paidAt?:         Date,

  attempts: [{
    merchantTxnNo:       string,   // unique index on "attempts.merchantTxnNo"
    status:              "pending" | "paid" | "failed" | "reversed" | "expired",
    expectedAmountPaise: number,   // snapshot at attempt time
    paidAmountPaise?:    number,
    txnId?:              string,   // ICICI's reference
    paymentMode?:        string,   // CARD / NB / UPI
    paymentDateTime?:    Date,
    createdAt:           Date,
    updatedAt:           Date,
  }],

  createdAt: Date,
  updatedAt: Date,
}

// gatewayEvents — append-only, SEPARATE collection
{
  _id:           ObjectId,
  merchantTxnNo: string,
  source:        "return" | "advice" | "settlement" | "status_check",
  payload:       object,   // the raw callback, untouched
  receivedAt:    Date,
}
```

**Indexes** (create once at startup):

```js
users.createIndex({ email: 1 }, { unique: true });
paymentLinks.createIndex({ token: 1 }, { unique: true });
paymentLinks.createIndex({ "attempts.merchantTxnNo": 1 }, { unique: true });
paymentLinks.createIndex({ status: 1, expiresAt: 1 }); // expiry cron
paymentLinks.createIndex({ createdBy: 1, createdAt: -1 }); // staff's own list
gatewayEvents.createIndex({ merchantTxnNo: 1, receivedAt: -1 });
```

**Why events are a separate collection:** they grow without bound and a document is capped at
16 MB. Embedding them would eventually break the link document.

**Why attempts are embedded:** there are only ever a handful per link, and the callback path
gets to do one atomic update:

```js
paymentLinks.findOneAndUpdate(
  { "attempts.merchantTxnNo": txnNo },
  { $set: { "attempts.$.status": "paid", status: "paid", paidAt: new Date() } }
);
```

**One link, many attempts.** If a customer's card fails and they retry, that is a _new_
`merchantTxnNo` — ICICI treats each as permanently unique.

**Money is integer paise** (`5000000` = ₹50,000), formatted to `"50000.00"` only when building
the ICICI request. Mongo will happily store `500.50` as a BSON Double — nothing stops it, so
this is a discipline the code must enforce. Zod-validate every amount as
`z.number().int().positive()` on write.

## 6. Two different secrets — don't confuse them

|                   | Purpose               | Format                              | Constraint                                                           |
| ----------------- | --------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `token`           | The public link URL   | 32 chars base62, from `randomBytes` | Must be unguessable — it is the _only_ thing protecting the pay page |
| `merchant_txn_no` | Our ref sent to ICICI | ~19 chars, `[A-Za-z0-9]`            | **Max 20 chars, alphanumeric only** (§10.1)                          |

The token has no length limit — it's our own URL. Make it long. The `merchantTxnNo` is
tightly constrained by ICICI and is never exposed to the customer.

## 7. Approval flow

Threshold in config: `APPROVAL_THRESHOLD_PAISE=5000000
CRON_SECRET=<secret>          # Vercel Cron sends this as a Bearer token` (₹50,000).

```
Staff creates link
  ├─ amount ≤ ₹50,000  → status = 'active', expires_at = now + 24h
  └─ amount >  ₹50,000 → status = 'pending_approval'
                          → email the admin
                          → admin approves → 'active', expires_at = now + 24h
                          → admin rejects  → 'rejected', link permanently dead
```

Admin-created links skip approval regardless of amount.

**The pay page must check status, not just the token.** Staff have the URL the moment they
create the link and may send it before approval lands. A `pending_approval` link must render
"awaiting approval" and refuse to start a payment.

**The expiry clock starts at approval, not creation.** Otherwise an admin who approves 20
hours late leaves the customer 4 hours to pay.

## 8. Routes

**Pages**

| Path                  | Access       | Purpose                                 |
| --------------------- | ------------ | --------------------------------------- |
| `/staff/login`        | public       | Email + password                        |
| `/staff`              | staff, admin | Create link; list own links             |
| `/staff/admin`        | admin        | All links, all payments, approval queue |
| `/pay/[token]`        | public       | Customer-facing pay page                |
| `/pay/[token]/result` | public       | Outcome after returning from ICICI      |

**API**

| Route                                        | Access          | Purpose                              |
| -------------------------------------------- | --------------- | ------------------------------------ |
| `POST /api/links`                            | staff, admin    | Create link                          |
| `POST /api/links/[id]/approve`               | admin           | Approve                              |
| `POST /api/links/[id]/reject`                | admin           | Reject                               |
| `POST /api/links/[id]/cancel`                | owner, admin    | Kill an unpaid link                  |
| `POST /api/pay/[token]/initiate`             | public          | Create attempt + call `initiateSale` |
| `POST /api/payments/icici/return`            | ICICI (browser) | Show the customer a result           |
| `POST /api/payments/icici/advice`            | ICICI (server)  | **Source of truth**                  |
| `POST /api/payments/icici/settlement-advice` | ICICI (server)  | Settlement status                    |

The two advice URLs are fixed with ICICI at onboarding and hard to change later:

```
https://soraia.in/api/payments/icici/advice
https://soraia.in/api/payments/icici/settlement-advice
```

## 9. End-to-end flow

```
Staff logs in → enters amount + description + customer details
  → POST /api/links
      validate (Zod) → generate token → insert
      → ≤50k: active | >50k: pending_approval + email admin
  → UI shows the link with "Copy" and "Send on WhatsApp" (wa.me prefilled)

Staff sends link over WhatsApp. Customer opens https://soraia.in/pay/<token>
  → page shows amount, description, restaurant branding
  → refuses if status is not 'active' or expires_at has passed

Customer clicks Pay
  → POST /api/pay/[token]/initiate
      re-check status + expiry server-side
      generate merchant_txn_no → INSERT payment_attempt (pending)
      POST initiateSale to ICICI (JSON + secureHash in body)
      return { redirectURI, tranCtx }
  → browser → {redirectURI}?tranCtx={tranCtx}

Customer pays on ICICI's page (card / UPI / netbanking — never our servers)

  ├─ ICICI POSTs the customer's BROWSER to /return
  │     verify signature → render result page
  │
  └─ ICICI's SERVER POSTs to /advice   (independent, retried until 200)
        verify signature → compare amount → update attempt + link → 200

Later: /advice may fire AGAIN if status changes (e.g. a reversal).
Cron (15 min): status-check attempts stuck 'pending'; expire past-due links.
```

**Status Check** posts `application/x-www-form-urlencoded` to `/api/command` with
`transactionType=STATUS` and `originalTxnNo`. Branch on `txnStatus` (§10.4) — never on
`responseCode`. Leave `REQ` attempts pending; they are still in flight.

**Do not call ICICI when the link is created.** The request carries `txnDate`, and the
returned `tranCtx` has a short TTL. A link made Monday and opened Wednesday would be dead.
ICICI is called on the customer's click, not on link creation.

**`/advice` is the truth. `/return` exists so the customer sees something immediately** — a
customer can close their browser mid-payment, in which case `/return` never fires.

## 10. The three ICICI traps

### 10.1 `merchantTxnNo` — max 20 chars, alphanumeric only

No dashes. Over 20 chars and QR generation silently breaks (ICICI's own note). This rules out
both obvious candidates: a UUID (36 chars, dashed) and a Mongo `ObjectId` hex string (24
chars). A separate generator is required — the `_id` cannot be reused for this.

```ts
// src/lib/icici/txn-id.ts
import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** ≤20 chars, alphanumeric, time-ordered. e.g. "SORmf3k2p9qx7t2wla" */
export function generateMerchantTxnNo(prefix = "SOR"): string {
  const ts = Date.now().toString(36); // 8 chars until ~2059
  const bytes = randomBytes(8);
  let rand = "";
  for (let i = 0; i < bytes.length; i++) rand += ALPHABET[bytes[i] % 36];

  const id = `${prefix}${ts}${rand}`; // 3 + 8 + 8 = 19
  if (id.length > 20 || !/^[A-Za-z0-9]+$/.test(id)) throw new Error(`Invalid: ${id}`);
  return id;
}
```

Modulo bias is irrelevant — uniqueness comes from the unique index on
`attempts.merchantTxnNo`, with a retry on Mongo duplicate-key error `11000`.

### 10.2 Hash rules — ✅ VERIFIED AGAINST UAT, 20 Jul 2026

**These rules are confirmed working against the live endpoint**, not inferred from the docs.
A full ₹999.50 payment was completed end to end (`txnStatus: SUC`) via
`scripts/icici-spike.mjs`.

**The V1 rule, exactly:**

1. Drop `secureHash` / `securehash`.
2. Drop null, undefined and empty-string values.
3. **Drop booleans entirely.** A live Status Check response contains `"oth_charge": false`;
   including it as the string `"false"` produces a mismatch. It is treated as empty.
4. Sort keys by **ASCII / code-unit order — uppercase before lowercase.** This is JavaScript's
   default `.sort()`. Confirmed via `TransmissionDateTime` in a live response, which sorts
   _before_ all lowercase keys. Case-insensitive sorting fails.
5. Concatenate values only, no separator. `HMAC-SHA256`, hex, lowercase.

Three further findings from the spike:

- **Status Check accepts `merchantTxnNo` === `originalTxnNo`.** Our own reference works for
  both; a PG-side `txnID` is not needed. Resolves the §12.1 contradiction.
- **`returnURL` must be an endpoint we control.** Pointing it at ICICI's sample URL makes
  their demo receiver report a signature error _after_ payment — the payment itself still
  succeeds. Purely cosmetic, but it looks alarming.
- **The redirect host differs from the documented one.** Docs say `pgpayuat.icicibank.com`;
  UAT returns `pgpayuat.icici.bank.in` (both work — `.com` redirects to `.bank.in`). **Always
  use the `redirectURI` from the response. Never hardcode it.**

For historical context: the sample `secureHash` in ICICI's documentation still does not
reproduce, and their sample is internally inconsistent — the JSON block uses
`Dummyemail@icicibank.com` / `Manish` while the `HashText` below it uses
`narayan.kapase@phicommerce.com` / `Narayan`. Their sample is simply wrong; our
implementation is correct.

If a future change breaks the hash, check in order:

- `amount` must be exactly two decimals — `"100.00"`, never `"100"`.
- **Non-ASCII.** ICICI's Java sample hashes with `msg.getBytes("ASCII")` while keying UTF-8.
  A customer named `Zoë` breaks the hash. Transliterate `customerName` to ASCII and test
  with an accented name specifically.
- Whitespace in the key from copy-paste — `.trim()` it.
- Omit empty fields entirely rather than sending `""`.

Log the exact hash input string while spiking — if it goes to a tech call, that string lets
ICICI identify the wrong field in one reply.

**Hash format (V1):** sort params by _name_ ascending, concatenate _values_ only (no
separator), `HMAC-SHA256`, lowercase hex. Skip null/empty. Goes in the JSON body as
`secureHash` for `initiateSale`; as a form field for the `/command` APIs.

### 10.3 Hash what arrives, not a fixed field list

The spec says to include parameters even if not in the published spec, skipping only
null/empty ones. A hardcoded field list means any field ICICI adds later silently breaks
every callback.

```ts
// src/lib/icici/verify.ts
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyInboundHash(params: Record<string, string>, key: string): boolean {
  const received = params.secureHash ?? params.securehash;
  if (!received) return false;

  const rest: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k === "secureHash" || k === "securehash") continue;
    if (v == null || v === "") continue;
    rest[k] = v;
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
  const b = Buffer.from(received.toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b); // length guard: it throws otherwise
}
```

Nothing in that function names an ICICI field. That's the point — and the spec's own samples
prove it's necessary. The Status Check sample response contains `authCode`,
`TransmissionDateTime`, `paymentInstId` and `oth_charge`, **none of which appear in the
documented parameter table** (12.2). A hardcoded list would already be broken today.

Two further rules for this function:

- **Query parameters are excluded from the hash.** Spec, p.26: _"Only POST parameters are
  considered for secureHash calculation. Query parameters are not considered."_ Hash the
  parsed body only — never merge `searchParams` in.
- **Non-string values are skipped.** The Status Check response contains `"oth_charge": false`.
  Booleans are excluded from the hash entirely — verified against UAT (§10.2). So the
  parameter type is `Record<string, unknown>`, not `Record<string, string>`.

### 10.4 `txnStatus`, not `responseCode`, is the payment result

The single most dangerous field confusion in this integration. In a Status Check response:

- `responseCode: "000"` means **the status query succeeded** — not that the payment did.
- `txnStatus` is the actual payment outcome. Spec 12.2: _"For status of the original txn
  always check txnStatus and txnResponseCode."_

```
txnStatus:  REQ = received, still in process   ← do NOT mark failed
            SUC = successful
            REJ = rejected
            ERR = error during processing
```

Reading `responseCode` here would mark unpaid links as paid. The reconciliation cron must
branch on `txnStatus`, and must leave `REQ` attempts alone rather than expiring them.

Note also that `initiateSale` returns `responseDescription` while every other API returns
`respDescription`. Parse defensively.

### 10.5 `customerName` must be sanitised — ✅ VERIFIED

ICICI validates `customerName` against an undisclosed regex and **rejects the request
outright** (not a hash error — a validation error) for characters outside it. Tested against
UAT:

| Value               | Result                                                  |
| ------------------- | ------------------------------------------------------- |
| `Anne-Marie OBrien` | ✅ `R1000` — hyphens allowed                            |
| `Ravi Kumar Jr.`    | ✅ `R1000` — periods allowed                            |
| `O'Brien`           | ❌ `Invalid value for param(customerName)` — apostrophe |
| `Priya & Sons`      | ❌ rejected — ampersand                                 |
| `José Ferreira`     | ❌ rejected — accented characters                       |

The permitted set appears to be roughly `[A-Za-z0-9 .-]`. `O'Brien` and `José` are ordinary
names — without sanitising, those customers simply cannot be sent a payment link.

**Sanitise before sending, and store the real name in Mongo untouched.** The sanitised value
is only ICICI's copy:

```ts
// src/lib/icici/sanitize.ts
export function sanitizeName(raw: string): string {
  return raw
    .normalize("NFD") // split accents from base letters
    .replace(/[\u0300-\u036f]/g, "") // strip accents: José → Jose
    .replace(/[^A-Za-z0-9 .-]/g, "") // drop apostrophes, &, etc.
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 45); // spec limit
}
```

Apply the same treatment to any free text placed in `addlParam1` / `addlParam2` — the staff
description field ("Table for 4 — Ravi & family") will hit the same wall.

## 11. Duplicates and races

ICICI retries `/advice` until it gets a 200, and the browser return races the webhook.

- Callbacks **update** the embedded attempt matched by `attempts.merchantTxnNo`. Never
  insert. Attempt and link status change in the same atomic document update.
- Return **200** as soon as the write succeeds. A 500 on an already-processed callback makes
  ICICI retry forever.
- Status transitions are idempotent — applying the same result twice is a no-op. Use a
  filtered update (e.g. match `"attempts.status": "pending"`) so a replay is a natural no-op
  rather than something the code has to reason about.
- **Status can change after success.** Chapter 8 of the spec exists specifically to report _a
  later change in transaction status after the online transaction completed_. An attempt can
  go `paid → reversed` days later, which must also flip the link off `paid`.
- Guard against two attempts on one link both succeeding — once a link is `paid`,
  `/initiate` must refuse. Enforce it in the query filter, not with a read-then-write:
  `findOneAndUpdate({ token, status: "active" }, { $push: { attempts: … } })` — if the link
  is already `paid`, the filter matches nothing and no attempt is created.

## 12. Security

- **The merchant key** lives only in the host env store. `.env*` is already gitignored. Never
  in a `NEXT_PUBLIC_` variable.
- **Never trust the callback amount.** Compare against `expected_amount_paise`; flag
  mismatches instead of marking paid.
- **Never trust `addlParam1`/`addlParam2`** for state — they round-trip through the browser.
  Look up real state by `merchant_txn_no`.
- **Rate-limit `/staff/login`** — it's a password form on a public URL. Lock out after ~5
  failures.
- **Rate-limit `/api/pay/[token]/initiate`** — it triggers an outbound ICICI call.
- **Token enumeration:** 32 chars from `randomBytes` is not brute-forceable, but return the
  same generic "link not found or expired" for missing, expired, and rejected tokens.
- **Authorize every staff/admin route server-side.** Hiding a button is not access control —
  check the session role inside each handler.
- Reject callbacks whose `merchant_txn_no` isn't in the database.

## 13. Config

```
ICICI_BASE_URL=https://pgpayuat.icicibank.com/tsp/pg/api
ICICI_MERCHANT_ID=100000000007164
ICICI_AGGREGATOR_ID=A100000000007164
ICICI_MERCHANT_KEY=<secret>
ICICI_RETURN_URL=https://uat.soraia.in/api/payments/icici/return
MONGODB_URI=<secret>
MONGODB_DB=soraia
AUTH_SECRET=<secret>
RESEND_API_KEY=<secret>
ADMIN_ALERT_EMAIL=<admin email>
APPROVAL_THRESHOLD_PAISE=5000000
CRON_SECRET=<secret>          # Vercel Cron sends this as a Bearer token
LINK_TTL_HOURS=24
```

Fixed ICICI values: `currencyCode=356`, `payType=0`, `transactionType=SALE`, `txnDate` as
`YYYYMMDDHHMISS` in Asia/Kolkata.

**Serverless connection reuse.** Cache the `MongoClient` on a module-level global and reuse
it across invocations. Creating a client per request exhausts the Atlas connection limit
within a day — this is the standard Next + Mongo pattern and it is not optional:

```ts
// src/lib/db.ts
const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };
export const clientPromise =
  g._mongo ?? (g._mongo = new MongoClient(process.env.MONGODB_URI!).connect());
```

## 14. Build order

| #   | Work                                                                                                     | Depends on |
| --- | -------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | ~~**UAT hash spike**~~ ✅ **DONE** — `scripts/icici-spike.mjs`, payment completed                        | —          |
| 2   | ~~Mongo connection, indexes, seed 3 users~~ ✅ **DONE** — plus 22 unit tests                             | —          |
| 3   | ~~Auth.js login, session, role guards~~ ✅ **DONE** — incl. forced password change                       | —          |
| 4   | ~~Staff page: create link, list own links~~ ✅ **DONE**                                                  | —          |
| 5   | ~~Approval flow + admin dashboard + alert email~~ ✅ **DONE**                                            | Resend key |
| 6   | ~~`/pay/[token]` + `initiate` + `/return`~~ ✅ **DONE** — needs public URL for live callback             | —          |
| 7   | ~~`/advice` + `/settlement-advice`, idempotent~~ ✅ **DONE** — live traffic needs ICICI to register URLs | —          |
| 8   | ~~Cron: expire links, status-check stuck attempts~~ ✅ **DONE**                                          | —          |

1 runs in parallel with 2–5. **Nothing in 6+ is worth starting until 1 passes** — if the hash
behaves differently than assumed, the request-building code changes underneath it.

## 15. Open questions

**For the ICICI tech call:**

**Resolved by the UAT spike — no longer worth asking:**

- ~~The sample `secureHash` doesn't reproduce~~ → our implementation is correct, their sample
  is wrong. Proven by a live `R1000` and a completed ₹999.50 payment.
- ~~Boolean handling in the hash~~ → booleans are skipped entirely.
- ~~Sort case-sensitivity~~ → ASCII order, uppercase before lowercase.
- ~~Status Check `merchantTxnNo` vs `originalTxnNo`~~ → the same value works for both.
- ~~Is `txnDate` IST?~~ → we sent IST and it was accepted.

**Still open for ICICI:**

1. **Payment advice format** — we want JSON rather than the form-urlencoded default. Fixed at
   onboarding, so it has to be requested.
2. **Register advice URLs** for `uat.soraia.in` and `soraia.in` separately, plus the process
   and lead time for changing them later.
3. **Advice retry schedule** when we return a non-200.
4. **Non-ASCII in `customerName`** — run `spike sale 100 --accent` first; only ask if it fails.
5. **Confirm `merchantTxnNo` is never recycled** on their side.
6. **Confirm `pgpayuat.icici.bank.in`** is the intended redirect host and will persist — their
   documentation still shows `icicibank.com`.

**For Soraia — defaults assumed, confirm or correct:**

7. **Admin approval alert** — assumed an email to `ADMIN_ALERT_EMAIL` plus a badge on the
   dashboard. Is email right, or is checking the dashboard enough?
8. **Threshold boundary** — assumed _strictly greater than_ ₹50,000 needs approval, so
   exactly ₹50,000 goes straight through.
9. **Password resets** — with 3 fixed accounts, assumed the admin resets a password directly
   in the database. No forgot-password flow is built. Acceptable?
10. **Refunds** — the Refund API exists and is unimplemented here. Assumed admin-only and a
    later phase. Note `amount=0` performs a void, and a refund can never exceed the original
    amount. Confirm the phasing.
11. **Customer receipt** — ICICI emails a payment receipt to `customerEmailID` if provided.
    Do you also want your own branded confirmation email?
12. **Link cancellation** — assumed staff can cancel their own unpaid links and admin can
    cancel any.
