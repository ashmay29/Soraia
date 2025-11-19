"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20 lg:px-12">
      {/* Full-bleed background image; shift focus down to reveal more bottom */}
      <img
        src="3.jpeg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
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
            <h1 className="text-gold font-display -mt-8 mb-8 text-6xl tracking-tight italic md:-mt-16 md:text-7xl lg:text-8xl">
              Soraia
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
