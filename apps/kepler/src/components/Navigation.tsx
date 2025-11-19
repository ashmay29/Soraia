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
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="animate-fade-in">
            <h1 className="text-gold font-display text-2xl tracking-wide italic">Soraia</h1>
          </div>

          <div className="animate-fade-in hidden items-center gap-12 md:flex">
            <a
              href="#about"
              className="text-foreground hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors duration-300"
            >
              About
            </a>
            <a
              href="#experience"
              className="text-foreground hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors duration-300"
            >
              Experience
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
