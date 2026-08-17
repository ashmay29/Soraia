import type { ReactNode } from "react";

/**
 * Customer-facing wrapper. A white card on the cream background — dark text on white
 * is maximum contrast, which is what a payment screen needs. Trust over subtlety.
 */
export default function PayShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="font-display text-primary text-2xl tracking-tight italic">Soraia</p>
        </div>
        <div className="border-gold/50 rounded-lg border bg-white p-8 shadow-md">{children}</div>
        <p className="text-primary/70 mt-6 text-center text-xs">
          Payments are processed securely by ICICI Bank.
        </p>
      </div>
    </main>
  );
}
