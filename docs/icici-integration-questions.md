**Subject:** Orange PG UAT — successful test transaction, and a few configuration queries (MID 100000000007164)

Hi Team,

Thank you for sharing the Interface Specification (V0.4) and the UAT credentials.

We are pleased to report that we have **successfully completed an end-to-end test transaction**
on UAT — Initiate Sale returned `R1000`, the payment completed via UPI, and Transaction Status
confirms `txnStatus: SUC`. Our secure hash generation and verification are both working
correctly in each direction.

We have five queries remaining, mostly around onboarding configuration. We would be grateful
for your guidance so we can proceed to production readiness.

**Our use case, for context:** our staff generate a payment link for a customer, who then
completes payment on the hosted payment page. We are using Initiate Sale, Payment Advice,
Settlement Advice and Transaction Status. Refunds will follow in a later phase.

---

### 1. Payment Advice — format and retry behaviour

Chapter 8 notes that Payment Advice is sent as `application/x-www-form-urlencoded` by default,
or as JSON if opted for during onboarding.

**We would like to opt for JSON.** Please confirm this can be configured for our account.

Could you also share the **retry schedule** when our endpoint returns a non-200 response — how
many retries, and at what intervals?

### 2. Advice URL registration — UAT and Production

We understand the Payment Advice and Settlement Advice URLs are configured at onboarding
rather than passed per request. We would like to register the following:

| Environment | Payment Advice                                    | Settlement Advice                                            |
| ----------- | ------------------------------------------------- | ------------------------------------------------------------ |
| UAT         | `https://uat.soraia.in/api/payments/icici/advice` | `https://uat.soraia.in/api/payments/icici/settlement-advice` |
| Production  | `https://soraia.in/api/payments/icici/advice`     | `https://soraia.in/api/payments/icici/settlement-advice`     |

Please confirm both environments can be configured independently, and let us know the process
and lead time for updating these later if required.

### 3. Permitted character set for `customerName`

During testing we found that certain values are rejected with
`Invalid value for param(customerName) : ... expression not matched`. Our results:

| Value               | Result                         |
| ------------------- | ------------------------------ |
| `Anne-Marie OBrien` | Accepted                       |
| `Ravi Kumar Jr.`    | Accepted                       |
| `O'Brien`           | Rejected — apostrophe          |
| `Priya & Sons`      | Rejected — ampersand           |
| `José Ferreira`     | Rejected — accented characters |

As a restaurant we regularly serve guests with names such as `O'Brien` or `José`. We are
currently sanitising these values before submission.

Could you share the **exact permitted character set (or the validation regex)** for
`customerName`, and confirm whether the same restriction applies to `addlParam1`,
`addlParam2` and other alphanumeric fields? We would prefer to validate correctly on our side
rather than infer the rule by testing.

### 4. Redirect host — `icici.bank.in` vs `icicibank.com`

The Initiate Sale response returns a `redirectURI` on
`https://pgpayuat.icici.bank.in/...`, whereas the specification document shows
`https://pgpayuat.icicibank.com/...`. Both hosts currently work.

Please confirm the `.bank.in` host is intended and will persist, and let us know which host
Production will use. We always follow the `redirectURI` returned in the response rather than
hardcoding it, but we would like to allowlist the correct domains.

### 5. `merchantTxnNo` uniqueness

We generate a new unique `merchantTxnNo` for every transaction, including each retry after a
failed payment and each future refund, within the 20-character alphanumeric limit.

Please confirm these values must remain unique **permanently** on your side and are never
recycled, as we rely on this for Transaction Status and Refund lookups.

---

We would be happy to join a short technical call if that is easier, though we expect most of
the above can be confirmed over email.

Thank you for your support.

Best regards,
Aagam Ratadia
Soraia
