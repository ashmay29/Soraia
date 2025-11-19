import React from "react";
import { flowerPaths } from "./FlowerPaths";

export default function FlowerBorder() {
  // Calculate staggered animation delays for each path
  // Each path starts 80ms after the previous one for smooth sequential drawing
  const getAnimationDelay = (index: number) => index * 80;

  const botanicalFlower = (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {flowerPaths.map((pathData, index) => (
        <path
          key={index}
          d={pathData}
          className="animate-stroke text-primary"
          style={{
            animationDelay: `${getAnimationDelay(index)}ms`,
          }}
        />
      ))}
    </g>
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* Bottom Right - Rotated towards center */}
      <div className="absolute -right-64 -bottom-64 h-[900px] w-[900px] origin-center rotate-[135deg]">
        <svg
          viewBox="0 0 2500 3000"
          className="stroke-primary h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {botanicalFlower}
        </svg>
      </div>

      {/* Top Left - Rotated towards center */}
      <div className="absolute -top-64 -left-64 h-[900px] w-[900px] origin-center rotate-[315deg]">
        <svg
          viewBox="0 0 2500 3000"
          className="stroke-primary h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {botanicalFlower}
        </svg>
      </div>
    </div>
  );
}
