"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-background px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left Side - Contact Info */}
          <div
            className={`relative z-10 transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <h2 className="text-primary font-display mb-8 text-4xl md:text-5xl lg:text-6xl">
              Visit Us
            </h2>

            <div className="bg-gold mb-12 h-px w-16"></div>

            <div className="space-y-8">
              <div>
                <h3 className="text-primary mb-3 text-xs tracking-[0.2em] uppercase">Location</h3>
                <p className="text-foreground text-lg leading-relaxed">
                  Mumbai, India
                  <br />A destination for refined dining
                </p>
              </div>

              <div>
                <h3 className="text-primary mb-3 text-xs tracking-[0.2em] uppercase">
                  Reservations
                </h3>
                <div className="text-foreground mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-base md:text-lg">
                  <span className="font-light">Party enquiry</span>
                  <a
                    href="tel:+919004958000"
                    className="hover:text-gold justify-self-end text-right whitespace-nowrap transition-colors"
                  >
                    +91 90049 58000
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-primary mb-3 text-xs tracking-[0.2em] uppercase">Connect</h3>
                <div className="flex gap-6">
                  <a
                    href="https://www.instagram.com/soraiabombay?igsh=eXRrYTI0YmV0ZG9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-gold -m-2 inline-flex touch-manipulation items-center rounded p-2 transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-foreground hover:text-gold transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* Right Side - Reservation Card */}
          <div
            className={`relative z-0 h-full transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div
              className="bg-primary/95 text-background border-gold relative flex h-full min-h-[400px] w-full flex-col items-center justify-center border-2 p-12 text-center shadow-xl backdrop-blur-sm"
              style={{
                backgroundImage: "url('/background/background.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="mb-8 w-64 md:w-80">
                <Image
                  src="/envelope/reservation.png"
                  alt="Reservation"
                  width={1536}
                  height={1024}
                  className="h-auto w-full object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
              <p className="text-light font-body mb-10 max-w-md text-lg leading-relaxed opacity-90">
                Experience the essence of Soraia. We recommend booking in advance to ensure your
                preferred seating arrangements.
              </p>
              <button className="bg-gold text-primary hover:bg-light hover:text-primary font-display inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
