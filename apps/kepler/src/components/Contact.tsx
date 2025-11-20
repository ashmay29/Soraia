"use client";

import { useEffect, useRef, useState } from "react";

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left Side - Contact Info */}
          <div
            className={`transition-all duration-1000 ${
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
                <p className="text-foreground text-lg leading-relaxed">
                  For reservations and inquiries,
                  <br />
                  please contact our team
                </p>
              </div>

              <div>
                <h3 className="text-primary mb-3 text-xs tracking-[0.2em] uppercase">Connect</h3>
                <div className="flex gap-6">
                  <a
                    href="#"
                    className="text-foreground hover:text-gold transition-colors duration-300"
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
          {/* Right Side - Reservation (Envelope with letter) */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="relative mx-auto w-full">
              {/* Envelope image */}
              <div className="relative -mt-40 h-[34rem] w-full rounded-md bg-[url('/envelope/openenvelope.png')] bg-[length:120%] bg-center bg-no-repeat md:bg-[length:130%] lg:h-[48rem] lg:bg-[length:140%]">
                {/* Reservation graphic centered in the white space */}
                <img
                  src="/envelope/reservation.png"
                  alt="Reservation"
                  className="pointer-events-none absolute top-[22%] left-1/2 w-[36%] -translate-x-1/2 select-none md:top-[21%] md:w-[32%] lg:top-[32%] lg:w-[38%]"
                  loading="lazy"
                />
              </div>

              {/* CTA Button below the envelope */}
              <div className="-mt-24">
                <button className="bg-gold text-primary hover:bg-accent hover:text-background border-gold font-display mx-auto block rounded-sm border-2 px-8 py-4 text-xs tracking-[0.2em] uppercase">
                  MAKE A RESERVATION?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
