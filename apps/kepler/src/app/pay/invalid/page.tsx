import PayShell from "@/components/pay/PayShell";

export const metadata = {
  title: "Payment · Soraia",
  robots: { index: false, follow: false },
};

/** Shown when a callback fails verification or references an unknown transaction. */
export default function InvalidPage() {
  return (
    <PayShell>
      <p className="text-primary text-center text-sm leading-relaxed font-light">
        We could not confirm this payment. If money has left your account, please contact the
        restaurant with your bank reference and we will resolve it.
      </p>
    </PayShell>
  );
}
