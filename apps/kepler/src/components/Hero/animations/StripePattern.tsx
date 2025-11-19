import React from "react";

type Props = {
  colorClass?: string; // e.g. "text-gold" -> used via currentColor
  opacityClass?: string; // e.g. "opacity-20"
};

export default function StripePattern({
  colorClass = "text-primary",
  opacityClass = "opacity-20",
}: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-0 ${opacityClass}`}>
      <svg width="100%" height="100%" className={colorClass}>
        <defs>
          <pattern
            id="vertical-stripes"
            x="0"
            y="0"
            width="20"
            height="100%"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="2" height="100%" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vertical-stripes)" />
      </svg>
    </div>
  );
}
