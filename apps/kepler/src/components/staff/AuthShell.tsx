import type { ReactNode } from "react";

/** Centred card used by the login and change-password screens. */
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-primary text-3xl tracking-tight italic md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-primary/60 mt-3 text-sm leading-relaxed font-light">{subtitle}</p>
          )}
        </div>
        <div className="border-gold/40 bg-background rounded-sm border p-8 shadow-sm">
          {children}
        </div>
        <p className="text-primary/55 mt-8 text-center text-[10px] tracking-[0.25em] uppercase">
          Soraia · Staff Access
        </p>
      </div>
    </main>
  );
}
