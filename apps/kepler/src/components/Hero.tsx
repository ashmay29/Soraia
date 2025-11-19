"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-20 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center">
          {/* Main Title */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <h1 className="text-gold font-display mb-8 text-6xl tracking-tight italic md:text-7xl lg:text-8xl">
              Soraia
            </h1>
          </div>

          {/* Decorative Line */}
          <div
            className={`mb-12 flex justify-center transition-all duration-1000 ${
              isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="bg-gold h-px w-24"></div>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <p className="text-foreground mx-auto max-w-4xl text-base leading-relaxed font-light md:text-lg lg:text-xl">
              India&apos;s first modern Indian-European restaurant with an Omakase Bar,
              <br className="hidden md:block" />
              blending Indian warmth and European sophistication
            </p>
          </div>

          {/* CTA Button */}
          <div
            className={`mt-16 transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <a
              href="#experience"
              className="bg-primary text-background hover:bg-secondary border-primary hover:border-secondary inline-block border-2 px-12 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "1000ms" }}
      >
        <div className="flex animate-bounce flex-col items-center gap-2">
          <div className="bg-primary h-12 w-px"></div>
          <div className="bg-primary h-1 w-1 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
