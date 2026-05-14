"use client";

import Navigation from "@/components/navbar/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import ReservationCard from "@/components/ReservationCard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-grow">
        <Hero />
        <About />
        <Experience />
        {/* New Reservation Card as the primary contact and booking point */}
        <section id="contact" className="bg-background pt-0 pb-8">
          <div id="book" className="scroll-mt-20">
            <ReservationCard />
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
