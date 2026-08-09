import PayShell from "@/components/pay/PayShell";
import PayButton from "@/components/pay/PayButton";
import PolicyGate from "@/components/pay/PolicyGate";
import { formatInr } from "@/lib/config";
import { paymentLinks } from "@/lib/db";
import type { PaymentLink } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment · Soraia", robots: { index: false, follow: false } };

/**
 * The token is the only credential, so every unavailable case returns the SAME
 * message — never reveal whether a token exists but is expired, rejected, or wrong.
 */
function unavailableMessage(link: PaymentLink | null, now: Date): string | null {
  if (!link) return "This payment link is not valid.";
  if (link.status === "paid") return "This payment has already been completed. Thank you.";
  if (link.status === "pending_approval") {
    return "This payment link is awaiting approval. Please try again shortly, or contact the restaurant.";
  }
  if (link.status !== "active") return "This payment link is no longer available.";
  if (link.expiresAt && link.expiresAt.getTime() <= now.getTime()) {
    return "This payment link has expired. Please contact the restaurant for a new one.";
  }
  return null;
}

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const col = await paymentLinks();
  const link = await col.findOne({ token });
  const message = unavailableMessage(link, new Date());

  if (message || !link) {
    return (
      <PayShell>
        <p className="text-primary text-center text-sm leading-relaxed font-light">{message}</p>
      </PayShell>
    );
  }

  return (
    <PayShell>
      <PolicyGate token={token} />

      <div className="text-center">
        <p className="text-primary/75 text-[10px] tracking-[0.25em] uppercase">Amount due</p>
        <p className="font-display text-primary mt-3 text-4xl">{formatInr(link.amountPaise)}</p>
      </div>

      <dl className="border-primary/10 mt-8 space-y-3 border-t pt-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-primary/75 font-light">For</dt>
          <dd className="text-primary text-right font-light">{link.description}</dd>
        </div>
        {link.customer?.name && (
          <div className="flex justify-between gap-4">
            <dt className="text-primary/75 font-light">Name</dt>
            <dd className="text-primary text-right font-light">{link.customer.name}</dd>
          </div>
        )}
      </dl>

      <PayButton token={token} amount={formatInr(link.amountPaise)} />
    </PayShell>
  );
}
