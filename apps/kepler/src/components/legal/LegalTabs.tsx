"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DEFAULT_LEGAL_TAB, LEGAL_TABS, type LegalTabId } from "./content";

const TAB_IDS = LEGAL_TABS.map((tab) => tab.id);

function isLegalTabId(value: string | null): value is LegalTabId {
  return !!value && (TAB_IDS as string[]).includes(value);
}

export default function LegalTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<LegalTabId>(
    isLegalTabId(initialTab) ? initialTab : DEFAULT_LEGAL_TAB
  );

  const selectTab = (id: LegalTabId) => {
    setActiveTab(id);
    // Shallow URL update so the tab is deep-linkable/shareable without a page navigation.
    router.replace(`/legal?tab=${id}`, { scroll: false });
  };

  const active = LEGAL_TABS.find((tab) => tab.id === activeTab) ?? LEGAL_TABS[0];

  return (
    <main className="bg-background min-h-screen px-6 pt-32 pb-20 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-primary hover:text-gold mb-10 inline-block text-xs tracking-[0.2em] uppercase transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="border-gold mb-12 flex flex-wrap gap-x-8 gap-y-3 border-b pb-4">
          {LEGAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              aria-current={tab.id === activeTab ? "page" : undefined}
              className={`text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
                tab.id === activeTab ? "text-gold" : "text-primary/60 hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <h1 className="text-primary font-display mb-2 text-4xl md:text-5xl">{active.heading}</h1>
        {active.lastUpdated && (
          <p className="text-primary/60 text-sm">Last updated: {active.lastUpdated}</p>
        )}
        <div className="bg-gold my-8 h-px w-16" />

        <div className="text-foreground space-y-8 text-base leading-relaxed md:text-lg">
          {active.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-primary font-display mb-3 text-xl md:text-2xl">
                  {section.heading}
                </h2>
              )}
              <div className="space-y-4">
                {section.paragraphs.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
