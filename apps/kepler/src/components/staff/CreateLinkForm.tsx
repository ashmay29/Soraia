"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Field from "./Field";
import { rupeesToPaise } from "@/lib/money";
import ShareLink from "./ShareLink";

interface Created {
  url: string;
  needsApproval: boolean;
}

export default function CreateLinkForm({
  thresholdRupees,
  isAdmin,
}: {
  thresholdRupees: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

  const parsed = amount.trim() ? rupeesToPaise(amount) : null;
  const willNeedApproval =
    !isAdmin &&
    parsed !== null &&
    "paise" in parsed &&
    parsed.paise > Number(thresholdRupees) * 100;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const money = rupeesToPaise(amount);
    if ("error" in money) return setError(money.error);

    // Capture the form element now: after the await below, React has nullified the
    // synthetic event's currentTarget, so reading e.currentTarget then would throw.
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const clean = (v: FormDataEntryValue | null) => {
      const s = String(v ?? "").trim();
      return s === "" ? undefined : s;
    };

    setPending(true);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountPaise: money.paise,
        description: String(form.get("description") ?? "").trim(),
        customer: {
          name: clean(form.get("customerName")),
          phone: clean(form.get("customerPhone")),
          email: clean(form.get("customerEmail")),
        },
      }),
    });
    setPending(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error ?? "Could not create the link");

    setCreated({ url: data.url, needsApproval: data.needsApproval });
    formEl.reset();
    setAmount("");
    setPhone("");
    router.refresh(); // pull the new row into the list below
  }

  if (created) {
    return (
      <ShareLink
        url={created.url}
        phone={phone}
        needsApproval={created.needsApproval}
        onDone={() => setCreated(null)}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field
        label="Amount (₹)"
        name="amount"
        inputMode="decimal"
        placeholder="2500.00"
        required
        autoFocus
        disabled={pending}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        hint={
          willNeedApproval
            ? `Above ₹${thresholdRupees} — this will need admin approval before the customer can pay.`
            : undefined
        }
      />
      <Field
        label="What is this for?"
        name="description"
        placeholder="Table for 4, Saturday 8pm"
        required
        maxLength={200}
        disabled={pending}
      />

      <fieldset className="border-primary/10 space-y-5 border-t pt-5">
        <legend className="text-primary/55 text-[10px] tracking-[0.25em] uppercase">
          Customer (optional)
        </legend>
        <Field label="Name" name="customerName" maxLength={45} disabled={pending} />
        <Field
          label="Phone"
          name="customerPhone"
          inputMode="tel"
          placeholder="9876543210"
          maxLength={13}
          disabled={pending}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint="Adding a phone number enables one-tap sharing on WhatsApp."
        />
        <Field
          label="Email"
          name="customerEmail"
          type="email"
          maxLength={48}
          disabled={pending}
          hint="ICICI emails a payment receipt to this address."
        />
      </fieldset>

      {error && (
        <p role="alert" className="text-sm font-light text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-background hover:bg-primary/90 w-full rounded-sm px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create payment link"}
      </button>
    </form>
  );
}
