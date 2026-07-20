import { computeHash, merchantKey } from "./hash";
import { paiseToAmountString, sanitizeForIcici, txnDateIST } from "./format";

function baseUrl(): string {
  return (process.env.ICICI_BASE_URL ?? "https://pgpayuat.icicibank.com/tsp/pg/api").replace(
    /\/$/,
    ""
  );
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export interface InitiateSaleResult {
  ok: boolean;
  redirectUrl?: string;
  responseCode?: string;
  message?: string;
  raw: Record<string, unknown>;
}

/**
 * Server-to-server Initiate Sale (Standard mode, payType=0).
 *
 * On success ICICI returns R1000 plus a redirectURI and tranCtx. We always follow the
 * redirectURI from the response rather than hardcoding it — UAT returns a different
 * host (icici.bank.in) than the specification documents (icicibank.com).
 */
export async function initiateSale(params: {
  merchantTxnNo: string;
  amountPaise: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}): Promise<InitiateSaleResult> {
  const body: Record<string, string> = {
    merchantId: required("ICICI_MERCHANT_ID"),
    aggregatorID: required("ICICI_AGGREGATOR_ID"),
    merchantTxnNo: params.merchantTxnNo,
    amount: paiseToAmountString(params.amountPaise),
    currencyCode: "356",
    payType: "0",
    transactionType: "SALE",
    returnURL: required("ICICI_RETURN_URL"),
    txnDate: txnDateIST(),
  };

  // ICICI rejects the whole request for characters outside its allowed set, so every
  // free-text field is sanitised. Empty fields are omitted entirely, never sent as "".
  const name = sanitizeForIcici(params.customerName ?? "");
  if (name) body.customerName = name;

  if (params.customerEmail) body.customerEmailID = params.customerEmail;

  const phone = (params.customerPhone ?? "").replace(/\D/g, "");
  if (phone) body.customerMobileNo = phone;

  const note = sanitizeForIcici(params.description ?? "", 64);
  if (note) body.addlParam1 = note;

  body.secureHash = computeHash(body, merchantKey());

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/v2/initiateSale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      ok: false,
      message: "Could not reach the payment gateway",
      raw: { error: err instanceof Error ? err.message : "network error" },
    };
  }

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, message: "Unexpected gateway response", raw: { status: res.status, text } };
  }

  const responseCode = typeof json.responseCode === "string" ? json.responseCode : undefined;
  if (responseCode !== "R1000") {
    return {
      ok: false,
      responseCode,
      // initiateSale uses responseDescription; every other API uses respDescription.
      message:
        (json.responseDescription as string) ??
        (json.respDescription as string) ??
        (json.errorMsg as string) ??
        "The payment gateway rejected the request",
      raw: json,
    };
  }

  const redirectURI = json.redirectURI as string | undefined;
  const tranCtx = json.tranCtx as string | undefined;
  if (!redirectURI || !tranCtx) {
    return { ok: false, responseCode, message: "Gateway response was incomplete", raw: json };
  }

  return {
    ok: true,
    responseCode,
    redirectUrl: `${redirectURI}?tranCtx=${encodeURIComponent(tranCtx)}`,
    raw: json,
  };
}

/** 000 and 0000 both mean success in payment responses. */
export function isSuccessCode(code: unknown): boolean {
  return code === "000" || code === "0000";
}

export interface StatusResult {
  ok: boolean;
  /** REQ = still processing · SUC = paid · REJ = rejected · ERR = error */
  txnStatus?: "REQ" | "SUC" | "REJ" | "ERR";
  message?: string;
  raw: Record<string, unknown>;
}

/**
 * Transaction Status check. Note the different shape to initiateSale: this is
 * form-urlencoded to /command, not JSON.
 *
 * CRITICAL: `responseCode` here reports whether the QUERY succeeded, not the payment.
 * The payment outcome is `txnStatus`. Reading the wrong field marks unpaid links paid.
 *
 * merchantTxnNo and originalTxnNo may carry the same value — verified against UAT,
 * which resolves the contradiction in spec §12.1.
 */
export async function checkStatus(merchantTxnNo: string): Promise<StatusResult> {
  const body: Record<string, string> = {
    merchantId: required("ICICI_MERCHANT_ID"),
    aggregatorID: required("ICICI_AGGREGATOR_ID"),
    merchantTxnNo,
    originalTxnNo: merchantTxnNo,
    transactionType: "STATUS",
  };
  body.secureHash = computeHash(body, merchantKey());

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });
  } catch (err) {
    return {
      ok: false,
      message: "Could not reach the payment gateway",
      raw: { error: err instanceof Error ? err.message : "network error" },
    };
  }

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, message: "Unexpected gateway response", raw: { status: res.status, text } };
  }

  // responseCode covers the query itself; anything else means we learned nothing.
  if (!isSuccessCode(json.responseCode)) {
    return {
      ok: false,
      message: (json.respDescription as string) ?? "Status query failed",
      raw: json,
    };
  }

  const txnStatus = json.txnStatus as StatusResult["txnStatus"];
  return { ok: true, txnStatus, raw: json };
}
