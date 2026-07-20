import { Resend } from "resend";

/**
 * Email is best-effort and must NEVER block a payment link from being created.
 * If Resend is down or misconfigured, we log and carry on — losing an alert is
 * recoverable (the dashboard still shows the queue), losing the link is not.
 */

let client: Resend | null = null;

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return (client ??= new Resend(key));
}

export interface SendResult {
  sent: boolean;
  reason?: string;
  id?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const api = resend();
  if (!api) {
    // Expected in local dev — surface the mail rather than failing silently.
    console.warn(`[email] RESEND_API_KEY not set; skipping "${opts.subject}" to ${opts.to}`);
    return { sent: false, reason: "no_api_key" };
  }

  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.warn("[email] EMAIL_FROM not set; skipping send");
    return { sent: false, reason: "no_from_address" };
  }

  try {
    const { data, error } = await api.emails.send({ from, ...opts });
    if (error) {
      console.error("[email] send failed:", error.message);
      return { sent: false, reason: error.message };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { sent: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}

export function adminAlertAddress(): string | null {
  return process.env.ADMIN_ALERT_EMAIL ?? null;
}
