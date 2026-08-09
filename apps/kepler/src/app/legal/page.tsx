import type { Metadata } from "next";
import { Suspense } from "react";
import LegalTabs from "@/components/legal/LegalTabs";

export const metadata: Metadata = {
  title: "About, Contact & Policies - Soraia",
  description:
    "About Soraia, contact details, terms and conditions, return policy, and privacy policy.",
};

export default function LegalPage() {
  return (
    <Suspense fallback={null}>
      <LegalTabs />
    </Suspense>
  );
}
