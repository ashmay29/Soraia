/** Amounts above this need admin approval before the link can be paid. Default ₹50,000. */
export function approvalThresholdPaise(): number {
  return Number(process.env.APPROVAL_THRESHOLD_PAISE ?? 5_000_000);
}

/** How long an active link stays payable. The clock starts at approval, not creation. */
export function linkTtlHours(): number {
  return Number(process.env.LINK_TTL_HOURS ?? 24);
}

/** Absolute base URL for building shareable links. */
export function appBaseUrl(): string {
  const explicit = process.env.APP_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Vercel sets this per-deployment; falls back to local dev.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

export function payUrl(token: string): string {
  return `${appBaseUrl()}/pay/${token}`;
}

export function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(paise / 100);
}
