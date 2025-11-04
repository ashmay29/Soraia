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
    <section id="contact" ref={sectionRef} className="bg-light px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left Side - Contact Info */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <h2 className="text-primary mb-8 font-serif text-4xl md:text-5xl lg:text-6xl">
              Visit Us
            </h2>

            <div className="bg-primary mb-12 h-px w-16"></div>

            <div className="space-y-8">
              <div>
                <h3 className="text-secondary mb-3 text-sm tracking-widest uppercase">Location</h3>
                <p className="text-foreground text-lg leading-relaxed">
                  Mumbai, India
                  <br />A destination for refined dining
                </p>
              </div>

              <div>
                <h3 className="text-secondary mb-3 text-sm tracking-widest uppercase">
                  Reservations
                </h3>
                <p className="text-foreground text-lg leading-relaxed">
                  For reservations and inquiries,
                  <br />
                  please contact our team
                </p>
              </div>

              <div>
                <h3 className="text-secondary mb-3 text-sm tracking-widest uppercase">Connect</h3>
                <div className="flex gap-6">
                  <a
                    href="#"
                    className="text-foreground hover:text-primary transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-foreground hover:text-primary transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Reservation Form */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="bg-primary p-12">
              <h3 className="text-background mb-8 font-serif text-3xl">Make a Reservation</h3>

              <form className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    className="border-secondary text-background placeholder-secondary focus:border-background w-full border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="border-secondary text-background placeholder-secondary focus:border-background w-full border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="border-secondary text-background placeholder-secondary focus:border-background w-full border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      placeholder="Date"
                      className="border-secondary text-background placeholder-secondary focus:border-background w-full border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      placeholder="Time"
                      className="border-secondary text-background placeholder-secondary focus:border-background w-full border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Number of Guests"
                    min="1"
                    className="border-secondary text-background placeholder-secondary focus:border-background w-full border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Special Requests"
                    rows={4}
                    className="border-secondary text-background placeholder-secondary focus:border-background w-full resize-none border-b bg-transparent py-3 transition-colors duration-300 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-background text-primary hover:bg-light w-full py-4 text-sm tracking-widest uppercase transition-colors duration-300"
                >
                  Request Reservation
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
