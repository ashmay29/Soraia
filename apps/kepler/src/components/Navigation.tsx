"use client";

import { useState, useEffect } from "react";

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
            <h1
              className={`${scrolled ? "text-primary" : "text-gold"} font-display text-2xl tracking-wide italic transition-colors duration-300`}
            >
              Soraia
            </h1>
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
