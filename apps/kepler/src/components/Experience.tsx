"use client";

import { useEffect, useRef, useState } from "react";

export default function Experience() {
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

  const experiences = [
    {
      title: "Glasshouse Dining",
      description:
        "Mumbai's first glasshouse restaurant offering an immersive dining experience under the stars",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: "Omakase Bar",
      description:
        "An exclusive chef-curated experience blending Indian and European culinary artistry",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      title: "Mélange India Bar",
      description:
        "Region-inspired cocktails crafted with indigenous ingredients and modern techniques",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="experience" ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div
          className={`mb-20 text-center transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-primary font-display mb-6 text-4xl md:text-5xl lg:text-6xl">
            The Experience
          </h2>
          <div className="mb-8 flex justify-center">
            <div className="bg-gold h-px w-16"></div>
          </div>
          <p className="text-foreground mx-auto max-w-3xl text-lg leading-relaxed">
            Discover the unique elements that make Soraia an unforgettable destination
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${(index + 1) * 200}ms` }}
            >
              <div className="bg-background hover:bg-primary hover:text-background group border-secondary hover:border-gold h-full border-2 p-10 transition-all duration-500">
                <div className="text-gold group-hover:text-gold mb-6 transition-colors duration-500">
                  {exp.icon}
                </div>
                <h3 className="text-foreground group-hover:text-background font-display mb-4 text-2xl transition-colors duration-500">
                  {exp.title}
                </h3>
                <p className="text-foreground group-hover:text-background leading-relaxed transition-colors duration-500">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Opening Hours Section */}
        <div
          className={`mt-24 grid grid-cols-1 gap-16 transition-all duration-1000 lg:grid-cols-2 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="bg-primary text-background border-gold border-2 p-12">
            <h3 className="font-display mb-8 text-3xl">Opening Hours</h3>
            <div className="space-y-4">
              <div className="border-gold flex justify-between border-b pb-3">
                <span className="font-light">Monday - Friday</span>
                <span>11:00am - 1am</span>
              </div>
              <div className="space-y-2 pl-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-light">Lunch</span>
                  <span>12pm - 3pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light">Dinner</span>
                  <span>6pm - 10:30pm</span>
                </div>
              </div>
              <div className="border-gold flex justify-between border-b pt-2 pb-3">
                <span className="font-light">Saturday</span>
                <span>6pm - 1am</span>
              </div>
              <div className="pl-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-light">Dinner</span>
                  <span>6pm - 10:30pm</span>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-light">Sunday</span>
                <span className="text-gray">Closed</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary text-foreground border-primary border-2 p-12">
            <h3 className="font-display mb-8 text-3xl">The Dress Code</h3>
            <p className="mb-6 leading-relaxed">
              Members and their guests should be elegantly dressed, and gentlemen are required to
              wear a formal blazer and smart collared shirt at all times.
            </p>
            <p className="text-gray text-sm leading-relaxed">
              Whilst suits are actively encouraged, smart dark denim is permitted in the evening.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
