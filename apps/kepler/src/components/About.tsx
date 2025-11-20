"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
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
    <section id="about" ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <h2 className="text-primary font-display mb-8 text-4xl md:text-5xl lg:text-6xl">
              A Harmonious
              <br />
              Experience
            </h2>

            <div className="bg-gold mb-8 h-px w-16"></div>

            <div className="text-foreground space-y-6 text-base leading-relaxed md:text-lg">
              <p>
                Created by Dhaval Udeshi, Afsana Verma, and Amit Verma, with design by Gauri Khan,
                Soraia features Mumbai&apos;s first glasshouse restaurant and cuisine by Chef Hitesh
                Shanbhag that reimagines Indian flavors through European technique.
              </p>

              <p>
                Its &quot;Mélange India&quot; bar offers region-inspired cocktails, making Soraia a
                harmonious experience where culture, craft, and curiosity meet under the stars.
              </p>
            </div>
          </div>

          {/* Right Content - Decorative Box */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div
              className="bg-primary relative flex aspect-4/5 items-center justify-center p-12"
              style={{
                backgroundImage: "url('/background.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="border-gold flex h-full w-full items-center justify-center border-2 p-8">
                <div className="text-center">
                  <div className="border-gold mx-auto mb-6 flex h-24 w-24 items-center justify-center border-2">
                    <svg
                      className="text-gold h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gold font-display mb-4 text-2xl">Culinary Excellence</h3>
                  <p className="text-background text-sm leading-relaxed">
                    Where tradition meets innovation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
