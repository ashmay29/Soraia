"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
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
            <div className="mb-0.1 relative mx-auto h-32 w-96">
              <Image
                src="/name.png"
                alt="Soraia"
                fill
                className="object-contain"
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
