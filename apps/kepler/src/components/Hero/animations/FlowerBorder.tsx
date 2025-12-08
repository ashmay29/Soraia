import React from "react";
import { flowerPaths } from "./FlowerPaths";
import { GOLD_FILTER } from "@/lib/filters";

type Props = {
  colorClass?: string; // e.g. "text-gold" or "text-primary"
  opacityClass?: string; // e.g. "opacity-40"
};

export default function FlowerBorder({
  colorClass = "text-primary",
  opacityClass = "opacity-40",
}: Props) {
  // Calculate staggered animation delays for each path
  // Each path starts 80ms after the previous one for smooth sequential drawing
  const getAnimationDelay = (index: number) => index * 80;

  const isGold = colorClass === "text-gold";
  // If using the gold filter, use a neutral color (black) as the base so the filter applies correctly
  const svgColorClass = isGold ? "text-black" : colorClass;

  const botanicalFlower = (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: isGold ? GOLD_FILTER : "none",
      }}
    >
      {flowerPaths.map((pathData, index) => (
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
  );

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-500 ${opacityClass}`}
    >
      {/* Bottom Right - Rotated towards center */}
      <div className="absolute -right-64 -bottom-64 h-[900px] w-[900px] origin-center rotate-135">
        <svg
          viewBox="0 0 2500 3000"
          className={`h-full w-full ${svgColorClass}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {botanicalFlower}
        </svg>
      </div>

      {/* Top Left - Rotated towards center */}
      <div className="absolute -top-64 -left-64 h-[900px] w-[900px] origin-center rotate-315">
        <svg
          viewBox="0 0 2500 3000"
          className={`h-full w-full ${svgColorClass}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {botanicalFlower}
        </svg>
      </div>
    </div>
  );
}
