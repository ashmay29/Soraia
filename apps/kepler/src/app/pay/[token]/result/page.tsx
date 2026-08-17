import Link from "next/link";
import PayShell from "@/components/pay/PayShell";
import { formatInr } from "@/lib/config";
import { paymentLinks } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Payment result · Soraia",
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const col = await paymentLinks();
  const link = await col.findOne({ token });

  if (!link) {
    return (
      <PayShell>
        <p className="text-primary text-center text-sm font-light">
          This payment link is not valid.
        </p>
      </PayShell>
    );
  }

  if (link.status === "paid") {
    const paid = link.attempts.find((a) => a.status === "paid");
    return (
      <PayShell>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <span className="text-xl text-green-700">✓</span>
          </div>
          <h1 className="font-display text-primary mt-5 text-2xl italic">Payment received</h1>
          <p className="font-display text-primary mt-4 text-3xl">{formatInr(link.amountPaise)}</p>
          <p className="text-primary/75 mt-2 text-sm font-light">{link.description}</p>
        </div>

        {paid?.txnId && (
          <dl className="border-primary/10 mt-8 space-y-2 border-t pt-6 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-primary/75 font-light">Reference</dt>
              <dd className="text-primary font-mono">{paid.txnId}</dd>
            </div>
            {paid.paymentMode && (
              <div className="flex justify-between gap-4">
                <dt className="text-primary/75 font-light">Method</dt>
                <dd className="text-primary font-light">{paid.paymentMode}</dd>
              </div>
            )}
            {link.paidAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-primary/75 font-light">Date</dt>
                <dd className="text-primary font-light">{dateFmt.format(link.paidAt)}</dd>
              </div>
            )}
          </dl>
        )}

        <p className="text-primary/75 mt-8 text-center text-xs leading-relaxed font-light">
          Please keep this reference. A receipt has also been emailed to you if you provided an
          address.
        </p>
      </PayShell>
    );
  }

  // Not paid. Could be a genuine failure, or the webhook simply has not landed yet —
  // the browser sometimes returns before ICICI's server-to-server call arrives.
  const lastAttempt = link.attempts.at(-1);
  const stillPending = lastAttempt?.status === "pending";

  return (
    <PayShell>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <span className="text-xl text-amber-700">!</span>
        </div>
        <h1 className="font-display text-primary mt-5 text-2xl italic">
          {stillPending ? "Payment being confirmed" : "Payment not completed"}
        </h1>
        <p className="text-primary/75 mt-4 text-sm leading-relaxed font-light">
          {stillPending
            ? "We are waiting for confirmation from the bank. This page will show the result once it arrives — please refresh in a moment."
            : "The payment did not go through. No money has been taken."}
        </p>
      </div>

      {!stillPending && link.status === "active" && (
        <Link
          href={`/pay/${token}`}
          className="bg-primary text-background hover:bg-primary/90 mt-8 block w-full rounded-sm px-6 py-4 text-center text-sm tracking-[0.15em] uppercase transition-colors"
        >
          Try again
        </Link>
      )}

      <p className="text-primary/75 mt-8 text-center text-xs leading-relaxed font-light">
        If you believe you were charged, please contact the restaurant before trying again.
      </p>
    </PayShell>
  );
}
