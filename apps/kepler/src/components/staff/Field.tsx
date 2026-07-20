import type { InputHTMLAttributes } from "react";

export default function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-primary mb-2 block text-[11px] font-semibold tracking-[0.2em] uppercase">
        {label}
      </span>
      <input
        {...props}
        className="border-primary/40 text-primary focus:border-gold placeholder:text-primary/45 w-full rounded-sm border bg-transparent px-4 py-3 text-base transition-colors outline-none disabled:opacity-50"
      />
      {hint && <span className="text-primary/70 mt-2 block text-xs font-light">{hint}</span>}
    </label>
  );
}
