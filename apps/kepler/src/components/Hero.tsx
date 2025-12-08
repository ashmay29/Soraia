"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FlowerBorder from "@/components/Hero/animations/FlowerBorder";
import { GOLD_FILTER } from "@/lib/filters";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [dimFlowers, setDimFlowers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Dim the decorative flowers after the user scrolls down past the hero header area
  useEffect(() => {
    const onScroll = () => {
      setDimFlowers(window.scrollY > 120); // threshold to start reducing opacity
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20 lg:px-12">
      {/* Full-bleed background image; shift focus down to reveal more bottom */}
      <Image
        src="/background/3.jpeg"
        alt=""
        fill
        className="object-cover object-[center_70%]"
        priority
      />
      {/* Decorative linework overlays - changes from gold to green when dimmed */}
      <FlowerBorder
        colorClass={dimFlowers ? "text-primary" : "text-gold"}
        opacityClass={dimFlowers ? "opacity-5" : "opacity-90"}
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="text-center">
          {/* Main Title */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="mb-0.1 relative mx-auto h-32 w-96">
              <Image
                src="/logo/name.png"
                alt="Soraia"
                fill
                className="object-contain"
                style={{
                  filter: GOLD_FILTER,
                }}
                priority
                sizes="(max-width: 768px) 100vw, 384px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
