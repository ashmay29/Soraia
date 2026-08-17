"use client";

import { useReducer, useSyncExternalStore } from "react";
import { LEGAL_TABS } from "@/components/legal/content";

const GATED_TAB_IDS = ["terms", "return-policy", "privacy"] as const;
const POLICIES = LEGAL_TABS.filter((tab) =>
  GATED_TAB_IDS.includes(tab.id as (typeof GATED_TAB_IDS)[number])
);

function storageKey(token: string): string {
  return `soraia:pay:${token}:policy-ack`;
}

// No-op subscribe: acknowledgment only ever changes via the button below, which
// triggers its own re-render directly (see forceUpdate), so this store never needs
// to notify listeners on its own.
function subscribe() {
  return () => {};
}

// SSR has no access to localStorage. Defaulting to "not acknowledged" is the safe
// choice — it means the gate briefly renders on first paint for a returning visitor
// rather than ever letting an unacknowledged customer see the Pay button underneath.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Blocks the pay page behind the three payment-relevant policies until the customer
 * acknowledges them. Acknowledgment is remembered per link token (localStorage), not
 * globally — a different payment link shows it again.
 */
export default function PolicyGate({ token }: { token: string }) {
  const getSnapshot = () => window.localStorage.getItem(storageKey(token)) === "1";
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [, forceUpdate] = useReducer((c) => c + 1, 0);

  if (acknowledged) return null;

  function acknowledge() {
    window.localStorage.setItem(storageKey(token), "1");
    forceUpdate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-gate-heading"
    >
      <div className="border-gold/50 flex max-h-full w-full max-w-lg flex-col rounded-lg border bg-white shadow-xl">
        <div className="flex-1 overflow-y-auto p-8">
          <p className="font-display text-primary mb-6 text-center text-2xl tracking-tight italic">
            Soraia
          </p>

          {POLICIES.map((policy, i) => (
            <div key={policy.id} className={i > 0 ? "mt-10" : ""}>
              <h2
                id={i === 0 ? "policy-gate-heading" : undefined}
                className="text-primary font-display text-xl"
              >
                {policy.heading}
              </h2>
              {policy.lastUpdated && (
                <p className="text-primary/50 text-xs">Last updated: {policy.lastUpdated}</p>
              )}
              <div className="bg-gold my-3 h-px w-12" />
              <div className="space-y-4">
                {policy.sections.map((section, j) => (
                  <div key={j}>
                    {section.heading && (
                      <h3 className="text-primary mb-1.5 text-sm font-semibold">
                        {section.heading}
                      </h3>
                    )}
                    <div className="text-primary/85 space-y-2 text-sm leading-relaxed font-light">
                      {section.paragraphs.map((paragraph, k) => (
                        <p key={k}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-primary/10 border-t p-6">
          <button
            type="button"
            onClick={acknowledge}
            className="bg-primary text-background hover:bg-primary/90 w-full rounded-sm px-6 py-4 text-sm tracking-[0.15em] uppercase transition-colors"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
