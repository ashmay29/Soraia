"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRIMARY_FILTER, WHITE_FILTER } from "@/lib/filters";

// Shared image color filters (avoid duplication)

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 ${
        isMenuOpen ? "" : "transition-all duration-300"
      } ${
        !isMenuOpen && scrolled ? "bg-background/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Desktop Layout */}
          <div className="nav-desktop w-full items-center justify-between">
            {/* Left Section: Social Icons */}
            <div className="flex w-1/4 items-center gap-6">
              <a
                href="https://www.instagram.com/soraiabombay?igsh=eXRrYTI0YmV0ZG9"
                target="_blank"
                rel="noopener noreferrer"
                className={`${scrolled ? "text-primary" : "text-white"} hover:text-gold transition-colors`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 4.93c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            {/* Center Section: Links - Logo - Links */}
            <div className="flex flex-1 items-center justify-center gap-8 lg:gap-12">
              <div className="flex items-center gap-8 lg:gap-12">
                <Link
                  href="/#about"
                  className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:text-white`}
                >
                  About
                </Link>
                <Link
                  href="/#experience"
                  className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:text-white`}
                >
                  Experience
                </Link>
              </div>

              {/* Logo */}
              <Link href="/" aria-label="Home" className="relative block h-8 w-32 md:h-10 md:w-40">
                <Image
                  src="/logo/name.png"
                  alt="Soraia"
                  fill
                  className="object-contain transition-all duration-300"
                  style={{
                    filter: isMenuOpen ? WHITE_FILTER : scrolled ? PRIMARY_FILTER : "none",
                  }}
                  priority
                  sizes="(max-width: 768px) 7rem, 10rem"
                />
              </Link>

              <div className="flex items-center gap-8 lg:gap-12">
                <Link
                  href="/menu"
                  className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:text-white`}
                >
                  Menu
                </Link>
                <Link
                  href="/#contact"
                  className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:text-white`}
                >
                  Contact
                </Link>
                <Link
                  href="/legal"
                  className={`${scrolled ? "text-primary" : "text-gold"} text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:text-white`}
                >
                  Info
                </Link>
              </div>
            </div>

            {/* Right Section: CTA */}
            <div className="flex w-1/4 justify-end">
              <Link
                href="/#book"
                className={`${scrolled ? "text-primary border-primary" : "border-white text-white"} hover:text-primary border px-6 py-2 text-sm font-medium tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-white`}
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* Mobile Header (Logo + Hamburger) */}
          <div className="nav-mobile w-full items-center justify-between">
            <div className="z-50">
              {/* Logo image replacing text title, color-tinted via CSS filter */}
              <Link href="/" aria-label="Home" className="relative block h-6 w-28">
                <Image
                  src="/logo/name.png"
                  alt="Soraia"
                  fill
                  className="object-contain transition-all duration-300"
                  style={{
                    filter: isMenuOpen ? WHITE_FILTER : scrolled ? PRIMARY_FILTER : "none",
                  }}
                  priority
                  sizes="(max-width: 768px) 7rem, 8rem"
                />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group relative z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="relative flex h-4 w-6 flex-col justify-between">
                <span
                  className={`h-px w-full bg-current transition-all duration-300 ease-in-out ${
                    isMenuOpen
                      ? "absolute top-1/2 -translate-y-1/2 rotate-45 bg-white"
                      : scrolled
                        ? "bg-primary"
                        : "bg-white"
                  }`}
                />
                <span
                  className={`h-px w-full bg-current transition-all duration-300 ease-in-out ${
                    isMenuOpen
                      ? "absolute top-1/2 -translate-y-1/2 -rotate-45 bg-white"
                      : scrolled
                        ? "bg-primary"
                        : "bg-white"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`nav-mobile-overlay fixed inset-0 z-40 flex-col bg-[#00382e] transition-transform duration-500 ease-in-out ${
          isMenuOpen ? "flex translate-x-0" : "hidden translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-1 flex-col justify-center px-8">
          <nav className="flex flex-col gap-6">
            {[
              { label: "About", href: "/#about" },
              { label: "Experience", href: "/#experience" },
              { label: "Menu", href: "/menu" },
              { label: "Contact", href: "/#contact" },
              { label: "Info", href: "/legal" },
              { label: "Book Now", href: "/#book" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-4xl text-[#e0e0e0] transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-end justify-end px-8 pb-8">
          <div className="flex gap-4">
            {/* Social Icons (match desktop) */}
            <a
              href="https://www.instagram.com/soraiabombay?igsh=eXRrYTI0YmV0ZG9"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[#a0a0a0] transition-colors hover:text-white"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 4.93c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
