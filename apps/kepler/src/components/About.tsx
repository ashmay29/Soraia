"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
                backgroundImage: "url('/background/background.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="border-gold relative flex h-full w-full items-center justify-center border-2">
                {/* Paper Content Container */}
                <div className="relative h-full w-full overflow-hidden shadow-inner">
                  {/* Paper Texture */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/paper-texture.png"
                      alt="Paper Texture"
                      fill
                      className="object-cover opacity-90"
                    />
                  </div>

                  {/* Straight Collage Grid */}
                  <div className="absolute inset-8 z-10 grid grid-cols-2 grid-rows-6 gap-2">
                    {/* Top Left - Large Vertical */}
                    <div className="relative col-span-1 row-span-4 transition-transform hover:scale-[1.02]">
                      <Image
                        src="/DSC00869-Edit-2.jpg"
                        alt="Experience 1"
                        fill
                        className="object-cover shadow-md"
                      />
                    </div>

                    {/* Top Right - Small Square */}
                    <div className="relative col-span-1 row-span-2 transition-transform hover:scale-[1.02]">
                      <Image
                        src="/DSC00880-Edit.jpg"
                        alt="Experience 2"
                        fill
                        className="object-cover shadow-md"
                      />
                    </div>

                    {/* Middle Right - Medium Horizontal */}
                    <div className="relative col-span-1 row-span-2 transition-transform hover:scale-[1.02]">
                      <Image
                        src="/DSC01018-Edit.jpg"
                        alt="Experience 3"
                        fill
                        className="object-cover shadow-md"
                      />
                    </div>

                    {/* Bottom - Wide Horizontal spanning mostly bottom */}
                    <div className="relative col-span-2 row-span-2 transition-transform hover:scale-[1.02]">
                      <Image
                        src="/DSC00958-Edit.jpg"
                        alt="Experience 4"
                        fill
                        className="object-cover object-[center_30%] shadow-md"
                      />
                    </div>

                    {/* Ambience Text Overlay */}
                    <div className="pointer-events-none absolute top-[63%] left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                      <h3
                        className="font-display bg-cover bg-clip-text bg-center text-6xl tracking-widest text-transparent"
                        style={{
                          backgroundImage: "url('/paper-texture.png')",
                          WebkitBackgroundClip: "text",
                          filter: "brightness(1.1) contrast(0.9)", // Slight adjustment to match paper aesthetic
                        }}
                      >
                        AMBIENCE
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
