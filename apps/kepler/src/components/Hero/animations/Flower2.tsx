import React from "react";
import { flower2Paths } from "./Flower2Paths";

type Props = {
  colorClass?: string; // e.g. "text-gold" or "text-primary"
};

export default function Flower2({ colorClass = "text-primary" }: Props) {
  // Calculate staggered animation delays for each path
  // Each path starts 80ms after the previous one for smooth sequential drawing
  const getAnimationDelay = (index: number) => index * 80;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Bottom Left - Emerging towards center at 45 deg angle */}
      <div className="absolute -bottom-86 -left-18 h-[900px] w-[900px] origin-center rotate-55 opacity-20">
        <svg
          viewBox="0 0 500 500"
          className={`h-full w-full ${colorClass}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {flower2Paths.map((pathData, index) => (
              <path
                key={index}
                d={pathData}
                className="animate-stroke"
                style={{
                  animationDelay: `${getAnimationDelay(index)}ms`,
                }}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
