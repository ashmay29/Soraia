/** Amounts above this need admin approval before the link can be paid. Default ₹50,000. */
export function approvalThresholdPaise(): number {
  return Number(process.env.APPROVAL_THRESHOLD_PAISE ?? 5_000_000);
}

/** How long an active link stays payable. The clock starts at approval, not creation. */
export function linkTtlHours(): number {
  return Number(process.env.LINK_TTL_HOURS ?? 24);
}

/**
 * Absolute base URL for building shareable links.
 *
 * Order of precedence:
 *   1. APP_BASE_URL — set this to the canonical domain (e.g. https://soraia.in) to
 *      pin every generated link regardless of how the app is reached.
 *   2. The host of the request actually being served — so a link created while
 *      browsing https://soraia.in is a soraia.in link, not http://localhost:3000.
 *      This is what stops production links coming out as localhost when the env var
 *      above has not been set.
 *   3. Vercel's per-deployment domain, for any code path that runs without a request
 *      (e.g. a future cron job that emails a link).
 *   4. Local dev fallback.
 */
export async function appBaseUrl(): Promise<string> {
  const explicit = process.env.APP_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  try {
    // Imported lazily so this module stays usable outside a request scope (build,
    // tests) — headers() is only available while a request is being handled.
    const { headers } = await import("next/headers");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host.replace(/\/$/, "")}`;
    }
  } catch {
    // No request context (e.g. build-time) — fall through to the env-based value.
  }

  // Vercel sets this per-deployment; falls back to local dev.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel.replace(/\/$/, "")}` : "http://localhost:3000";
}

export async function payUrl(token: string): Promise<string> {
  return `${await appBaseUrl()}/pay/${token}`;
}

export function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(paise / 100);
}
