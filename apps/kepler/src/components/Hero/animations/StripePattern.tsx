import React from "react";

export default function StripePattern() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="vertical-stripes"
            x="0"
            y="0"
            width="20"
            height="100%"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="2" height="100%" className="fill-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vertical-stripes)" />
      </svg>
    </div>
  );
}
