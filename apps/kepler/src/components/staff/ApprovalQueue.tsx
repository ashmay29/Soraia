"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface PendingRow {
  id: string;
  amount: string;
  description: string;
  customerName?: string;
  createdByName: string;
  createdAt: string;
}

export default function ApprovalQueue({ pending }: { pending: PendingRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    let reason: string | null = null;
    if (action === "reject") {
      reason = prompt("Reason for rejecting? (optional — the staff member will see this)");
      if (reason === null) return; // cancelled the prompt
    } else if (!confirm("Approve this payment link? The customer will be able to pay it.")) {
      return;
    }

    setBusy(id);
    setError(null);
    const res = await fetch(`/api/links/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason ?? undefined }),
    });
    setBusy(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Could not ${action} that link`);
      router.refresh(); // the queue is stale — pull the real state
      return;
    }
    router.refresh();
  }

  if (pending.length === 0) {
    return (
      <p className="text-primary/65 border-primary/10 border-t py-10 text-center text-sm font-light">
        Nothing awaiting approval.
      </p>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 text-sm font-light text-red-700">
          {error}
        </p>
      )}
      <ul className="divide-primary/10 border-primary/10 divide-y border-t">
        {pending.map((row) => (
          <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
            <div className="min-w-0 flex-1">
              <span className="font-display text-primary text-xl">{row.amount}</span>
              <p className="text-primary/70 mt-1 text-sm font-light">{row.description}</p>
              <p className="text-primary/55 mt-1 text-xs font-light">
                {row.customerName ? `${row.customerName} · ` : ""}
                by {row.createdByName} · {row.createdAt}
              </p>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => act(row.id, "reject")}
                disabled={busy === row.id}
                className="rounded-sm border border-red-300 px-4 py-2 text-xs tracking-[0.15em] text-red-700 uppercase transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => act(row.id, "approve")}
                disabled={busy === row.id}
                className="bg-primary text-background hover:bg-primary/90 rounded-sm px-5 py-2 text-xs tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
              >
                {busy === row.id ? "…" : "Approve"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
