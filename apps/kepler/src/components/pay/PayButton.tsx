"use client";

import { useState } from "react";

export default function PayButton({ token, amount }: { token: string; amount: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPending(true);
    setError(null);

    const res = await fetch(`/api/pay/${token}/initiate`, { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.redirectUrl) {
      setError(data.error ?? "Could not start the payment. Please try again.");
      setPending(false);
      return;
    }

    // Leave `pending` set — the browser is navigating away to ICICI, and re-enabling
    // the button would invite a second attempt against the same link.
    window.location.href = data.redirectUrl;
  }

  return (
    <>
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="bg-primary text-background hover:bg-primary/90 mt-8 w-full rounded-sm px-6 py-4 text-sm tracking-[0.15em] uppercase transition-colors disabled:opacity-60"
      >
        {pending ? "Redirecting to payment…" : `Pay ${amount}`}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm font-light text-red-700">
          {error}
        </p>
      )}

      <p className="text-primary/75 mt-4 text-center text-xs font-light">
        You will be taken to ICICI Bank to complete payment by card, UPI or net banking.
      </p>
    </>
  );
}
