"use client";

import Image from "next/image";

export default function ReservationCard() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-6 lg:px-12">
      <div
        className="bg-primary/95 text-background border-gold relative overflow-hidden rounded-sm border-2 shadow-xl backdrop-blur-sm transition-all duration-500"
        style={{
          backgroundImage: "url('/background/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Content Container with increased horizontal padding */}
        <div className="relative z-10 grid grid-cols-1 items-center gap-12 px-10 py-12 md:px-16 lg:grid-cols-12 lg:gap-8 lg:px-20">
          {/* Section 1: Left - Heading + Supporting Copy (4 cols) */}
          <div className="flex flex-col space-y-6 text-center lg:col-span-5 lg:text-left">
            <h2 className="font-display text-3xl leading-tight tracking-tight italic md:text-4xl lg:text-4xl">
              Make Reservations
            </h2>
            <p className="text-background/70 mx-auto max-w-[340px] text-sm leading-[1.8] font-light md:text-[15px] lg:mx-0">
              For table bookings and private dining inquiries, connect directly with our team. We
              will help you plan a thoughtful dining experience.
            </p>
          </div>

          {/* Section 2: Center - Concierge Number (4 cols) */}
          <div className="flex flex-col items-center justify-center text-center lg:col-span-4">
            <span className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase opacity-60 md:text-xs">
              Private Concierge
            </span>
            <a
              href="tel:+919004983000"
              className="font-display hover:text-gold text-2xl leading-relaxed tracking-wide transition-colors duration-500 md:text-3xl lg:text-3xl"
            >
              +91 90049 83000
            </a>
          </div>

          {/* Section 3: Right - CTA (3 cols) */}
          <div className="flex items-center justify-center lg:col-span-3 lg:justify-end lg:pt-8">
            <a
              href="https://wa.me/919004983000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/80 hover:text-background border-background/20 hover:border-background/60 border-b pb-1 text-sm font-light tracking-wide italic transition-all duration-500"
            >
              Eager to reserve? Message us.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
