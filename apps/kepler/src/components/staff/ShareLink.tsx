"use client";

import { useState } from "react";

/** Shown right after creation — the moment staff need to get the link to the customer. */
export default function ShareLink({
  url,
  phone,
  needsApproval,
  onDone,
}: {
  url: string;
  phone?: string;
  needsApproval: boolean;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false); // clipboard blocked (insecure origin) — the text stays selectable
    }
  }

  // Digits only; prefix India's country code when a bare 10-digit number is given.
  const digits = (phone ?? "").replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  const waText = encodeURIComponent(`Here is your payment link for Soraia: ${url}`);
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary text-sm font-medium">Payment link created</p>
        {needsApproval && (
          <p className="mt-2 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-light text-amber-900">
            This amount is above the approval limit. The customer will not be able to pay until an
            admin approves it — you can still send the link now.
          </p>
        )}
      </div>

      <div className="border-primary/15 bg-primary/5 rounded-sm border p-4">
        <code className="text-primary block text-xs break-all">{url}</code>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="border-primary/30 text-primary hover:bg-primary hover:text-background flex-1 rounded-sm border px-5 py-3 text-xs tracking-[0.15em] uppercase transition-colors"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-background hover:bg-primary/90 flex-1 rounded-sm px-5 py-3 text-center text-xs tracking-[0.15em] uppercase transition-colors"
        >
          Send on WhatsApp
        </a>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="text-primary/65 hover:text-primary w-full text-xs font-light underline-offset-4 transition-colors hover:underline"
      >
        Create another link
      </button>
    </div>
  );
}
