"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 ${
        scrolled ? "bg-background/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <div>
            {/* Logo image replacing text title, color-tinted via CSS filter */}
            {(() => {
              const goldFilter =
                "brightness(0) saturate(100%) invert(78%) sepia(57%) saturate(462%) hue-rotate(356deg) brightness(95%) contrast(92%)";
              const primaryFilter =
                "brightness(0) saturate(100%) invert(12%) sepia(21%) saturate(1068%) hue-rotate(116deg) brightness(90%) contrast(93%)";
              return (
                <div className="relative h-6 w-28 md:h-7 md:w-32" aria-label="Soraia">
                  <Image
                    src="/name.png"
                    alt="Soraia"
                    fill
                    className="object-contain"
                    style={{ filter: scrolled ? primaryFilter : goldFilter }}
                    priority
                    sizes="(max-width: 768px) 7rem, 8rem"
                  />
                </div>
              );
            })()}
          </div>

          <div className="hidden items-center gap-12 md:flex">
            <a
              href="#about"
              className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 md:text-base`}
            >
              About
            </a>
            <a
              href="#experience"
              className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 md:text-base`}
            >
              Experience
            </a>
            <a
              href="#contact"
              className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 md:text-base`}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
