"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LinkStatus } from "@/lib/types";

export interface LinkRow {
  id: string;
  url: string;
  amount: string;
  description: string;
  customerName?: string;
  status: LinkStatus;
  createdAt: string;
  expiresAt?: string;
  isExpired: boolean;
  rejectedReason?: string;
}

const STATUS_STYLES: Record<LinkStatus, string> = {
  paid: "bg-green-50 text-green-800 border-green-200",
  active: "bg-blue-50 text-blue-800 border-blue-200",
  pending_approval: "bg-amber-50 text-amber-900 border-amber-300",
  rejected: "bg-red-50 text-red-800 border-red-200",
  cancelled: "bg-neutral-100 text-neutral-600 border-neutral-300",
  expired: "bg-neutral-100 text-neutral-600 border-neutral-300",
};

const STATUS_LABELS: Record<LinkStatus, string> = {
  paid: "Paid",
  active: "Awaiting payment",
  pending_approval: "Awaiting approval",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
};

export default function LinkList({ links }: { links: LinkRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function cancel(id: string) {
    if (!confirm("Cancel this payment link? The customer will no longer be able to pay.")) return;
    setBusy(id);
    const res = await fetch(`/api/links/${id}/cancel`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not cancel that link");
      return;
    }
    router.refresh();
  }

  async function copy(row: LinkRow) {
    try {
      await navigator.clipboard.writeText(row.url);
      setCopied(row.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  if (links.length === 0) {
    return (
      <p className="text-primary/65 border-primary/10 border-t py-10 text-center text-sm font-light">
        No payment links yet.
      </p>
    );
  }

  return (
    <ul className="divide-primary/10 border-primary/10 divide-y border-t">
      {links.map((row) => {
        // A link past its expiry is functionally dead even while the row still says
        // "active" — the cron has not swept it yet. Show the truth.
        const status: LinkStatus =
          row.isExpired && row.status === "active" ? "expired" : row.status;
        const canCancel = status === "active" || status === "pending_approval";

        return (
          <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-primary text-lg">{row.amount}</span>
                <span
                  className={`rounded-sm border px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${STATUS_STYLES[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <p className="text-primary/70 mt-1 truncate text-sm font-light">{row.description}</p>
              {status === "rejected" && row.rejectedReason && (
                <p className="mt-2 border-l-2 border-red-300 pl-3 text-xs font-light text-red-800">
                  Rejected: {row.rejectedReason}
                </p>
              )}
              <p className="text-primary/55 mt-1 text-xs font-light">
                {row.customerName ? `${row.customerName} · ` : ""}
                {row.createdAt}
                {row.expiresAt && status === "active" ? ` · expires ${row.expiresAt}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 gap-4">
              {status === "active" && (
                <button
                  type="button"
                  onClick={() => copy(row)}
                  className="text-primary/60 hover:text-primary text-xs font-light underline-offset-4 transition-colors hover:underline"
                >
                  {copied === row.id ? "Copied" : "Copy"}
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => cancel(row.id)}
                  disabled={busy === row.id}
                  className="text-xs font-light text-red-700 underline-offset-4 transition-colors hover:underline disabled:opacity-50"
                >
                  {busy === row.id ? "Cancelling…" : "Cancel"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
