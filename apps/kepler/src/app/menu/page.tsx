"use client";

import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/navbar/Navigation";
import Image from "next/image";
import FlowerBorder from "@/components/Hero/animations/FlowerBorder";

// Menu data structure
const menuData = [
  {
    category: "THE FIRST FLUSH",
    items: [
      { name: "TOMATO HALWA", description: "Raisins | Cashews | Varq" },
      { name: "WATERMELON GUACAMOLE", description: "Tomato foam | Tostada" },
    ],
  },
  {
    category: "THE SEED",
    items: [
      { name: "SHISO CHAAT", description: "Shiso Leaf | Pomegranate | Tangy Chutney | Sev" },
      { name: "VINE & BURRATA", description: "Candy & Baby Beets | Fennel Dressing" },
      { name: "PALM HEART CRUDO", description: "Palm Hearts | Spicy Granola | Cashew Foam" },
      { name: "FRUIT CEVICHE", description: "Fruit | Chaas | Puffed Black Rice | Chlorophyll Oil" },
      {
        name: "WARM BRIE HIVE",
        description: "Brie | Phyllo | Apple Coulis | Chili Maple Nut Crunch",
      },
      {
        name: "SORAIA'S AVO TOAST",
        description: "Avocado | Sourdough | Sweet Cream Cheese | Add On: Egg",
      },
    ],
  },
  {
    category: "LIGHT",
    items: [
      { name: "LOTUS CRUNCH & DIP", description: "Guacamole | East-Indian Bottle Masala" },
      { name: "LO BAK GO", description: "Daikon Cakes | Bird's Eye Chili | Sesame Seeds" },
      { name: "SWEET POTATO TUK", description: "Sweet Potato | Hot & Sweet Aioli | Paprika" },
      { name: "SORAIA CILBIR", description: "Pizza Fritta | Ivy Gourd Pickle | Labneh" },
      {
        name: "BAKED PEPPER FISH",
        description: "Catch Of The Day | Asparagus | Cheddar Chilli Foam",
      },
      { name: "MOJO KOLI CHICKEN", description: "Tender Coconut Risotto | Pineapple Pico" },
      { name: "CHILLI LIME CRAB", description: "Baked Pastry | Bright Lime Jalapeno Jam" },
      {
        name: "BLACK NOIR",
        description: "House-Made Brioche | Liver Parfait | Whiskey Butter | Black Truffle",
      },
    ],
  },
  {
    category: "FIRE",
    items: [
      { name: "MOROCCAN COTTAGE CHEESE", description: "Ras Al Hanout | Toum | Duqqa" },
      { name: "GUCCHI SILK", description: "Kashmiri Morels | Sattu" },
      { name: "CHICKEN OLEA", description: "Olive & Bell Pepper Tapenade | Green Olive Mayo" },
      {
        name: "TRUFFLED CHICKEN TIKKA",
        description: "Smoked Muhammara | Parmesan | Truffle Oil Finish",
      },
      { name: "TANGY TOMATO PRAWNS", description: "Tomato-Chilli Prawns | Toasted Peanut Crumble" },
      { name: "COASTAL FISH", description: "Catch Of The Day | Banana Chutney | Nadru Pickle" },
      { name: "LENTIL LAMB KEBAB", description: "Lentil Lamb Mince | Walnut Chutney" },
      {
        name: "NAAN TURNOVERS",
        description: "Smoked Dal Makhani | Broccoli & Blue Cheese OR Chicken & Cheddar",
      },
      { name: "LOTUS STEM PINSA", description: "Carpaccio | Malabar Spinach Moss" },
      { name: "LAMB & PETALS PINSA", description: "Braised Lamb | Stracciatella" },
      { name: "RATATOUILLE PINSA", description: "Eggplant | Zucchini | Heirloom Tomato" },
      { name: "FUNGHI ALL WHITE PIDE", description: "Mixed Mushrooms | Garlic Cream | Thyme" },
    ],
  },
  {
    category: "EARTH",
    items: [
      {
        name: "JACKFRUIT BERRY PULAO",
        description: "Fragrant Rice | Tender Jackfruit | Spiced Berries | Cucumber Yogurt",
      },
      { name: "FOREST MUSHROOM RISOTTO", description: "Enoki | Shimeji | Shiitake | Morels" },
      { name: "SPICY MARY SPAGHETTI", description: "Spiced Vegetarian Bolognese | Burratina" },
      { name: "CHURPI & KANDHARI BADAM AGNOLOTTI", description: "Yak Cheese | Kandhari Badam" },
      { name: "TANDOORI LAMB RACK", description: "Charred Lamb Rack | Potato Rösti | Shiraz Jus" },
      {
        name: "TIGER PRAWN XEC XEC",
        description: "Coastal Spiced Prawns | Housemade Poee | Coconut Curry",
      },
      {
        name: "COASTAL TOMATO FISH",
        description: "Seared Fish | Tangy Tomato Gassi | Crispy Kori Roti",
      },
      {
        name: "FIVE SPICED DUCK BREAST",
        description: "Pan-Seared Duck | Garlic Mash | Wilted Spinach",
      },
    ],
  },
  {
    category: "AIR",
    items: [
      {
        name: "COCOA & SIN",
        description: "Silky Dark Chocolate | Olive Cocoa Leather | Extra Virgin Olive Oil",
      },
      { name: "COFFEE & ROSES", description: "Nutmeg | Kahlua Cream" },
      { name: "BANANA CAKE", description: "Warm Banana Sponge | Frozen Coconut Cream" },
      {
        name: "SITAFAL TRES LECHES",
        description: "Classic Soaked Cake | Whipped Cream | Custard Apple",
      },
    ],
  },
];

export default function MenuPage() {
  const [dimFlowers, setDimFlowers] = useState(false);

  // Dim the decorative flowers after the user scrolls down past the hero header area
  useEffect(() => {
    const onScroll = () => {
      setDimFlowers(window.scrollY > 120); // threshold to start reducing opacity
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20 lg:px-12">
        {/* Full-bleed background image with cream background */}
        <Image
          src="/background/3.jpeg"
          alt=""
          fill
          className="object-cover object-[center_70%]"
          priority
        />
        {/* Decorative gold linework overlays */}
        <FlowerBorder
          colorClass="text-gold"
          opacityClass={dimFlowers ? "opacity-5" : "opacity-90"}
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="text-center">
            {/* Menu Title */}
            <h1 className="font-display text-gold mb-8 text-6xl tracking-wide">Menu</h1>
          </div>
        </div>
      </section>

      {/* Three-Column Menu Section */}
      <ThreeColumnMenuSection />

      {/* Section 1: Classic Cocktails - Two Column Drink List on Left, Image on Right */}
      <ClassicCocktailsSection />

      {/* Section 2: Craft Beverages - Image on Left, Text on Right */}
      <CraftBeveragesSection />

      {/* Section 3: Mezcal & Gin - Two Column Drink List on Left, Image on Right */}
      <MezcalGinSection />
    </div>
  );
}

function ThreeColumnMenuSection() {
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
      { threshold: 0.1 }
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
    <section ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
          {/* LEFT COLUMN - Single Tall Image */}
          <div
            className={`hidden transition-all duration-1000 lg:block ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <div className="relative h-full min-h-[2000px] overflow-hidden rounded-sm">
              <Image
                src="/background/background.png"
                alt="Menu background"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* CENTER COLUMN - Menu Content */}
          <div
            className={`space-y-16 transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {menuData.map((category, idx) => (
              <div key={idx} className="text-center">
                {/* Category Header */}
                <h3 className="text-gold font-display mb-6 text-2xl font-bold tracking-[0.3em] uppercase">
                  {category.category}
                </h3>

                {/* Menu Items */}
                <div className="space-y-3">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="space-y-1">
                      <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                        {item.name}
                      </h4>
                      <p className="text-primary/70 text-md leading-relaxed italic">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Divider between categories (except last) */}
                {idx < menuData.length - 1 && (
                  <div className="bg-gold/30 mx-auto mt-12 h-px w-24"></div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN - Single Tall Image */}
          <div
            className={`hidden transition-all duration-1000 lg:block ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="relative h-full min-h-[2000px] overflow-hidden rounded-sm">
              <Image
                src="/background/background.png"
                alt="Menu background"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClassicCocktailsSection() {
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

  const cocktails = [
    { name: "OLD FASHIONED", description: "Michters Bourbon | Sugar | Bitters" },
    {
      name: "WHISKEY SOUR",
      description: "Ballantines Whisky | Sugar | Lime | Bitters | Vegan Foamer",
    },
    { name: "MANHATTAN", description: "Michters Bourbon | Sweet Vermouth | Bitters" },
    { name: "BOULEVARDIER", description: "Michters Bourbon | Campari | Sweet Vermouth" },
    { name: "COSMOPOLITAN", description: "Absolut Vodka | Cointreau | Cranberry Juice | Lime" },
    { name: "MOSCOW MULE", description: "Absolut Vodka | Ginger Ale | Lime" },
    { name: "BLACK RUSSIAN", description: "Absolut Vodka | Kahlua" },
    {
      name: "MARTINI (DRY/DIRTY)",
      description: "Beefeater London Dry Gin | Dry Vermouth | Olives",
    },
    { name: "GIN BASIL SMASH", description: "Beefeater London Dry Gin | Basil | Lime | Sugar" },
    { name: "NEGRONI", description: "Beefeater London Dry Gin | Campari | Sweet Vermouth" },
    { name: "CUBA LIBRE", description: "Flor De Cana 7 Yrs | Coke | Lime" },
    { name: "DARK N STORMY", description: "Flor De Cana 7 Yrs | Ginger Ale | Lime" },
    { name: "DAIQUIRI", description: "Flor De Cana 4 Yrs | Lime | Sugar" },
    { name: "TOMMY'S MARGARITA", description: "Jose Cuervo Silver | Agave | Lime" },
    {
      name: "CLASSIC PICANTÉ",
      description: "Jose Cuervo Reposado | Jalapeño | Coriander | Agave | Lime",
    },
    { name: "PALOMA", description: "Jose Cuervo Silver | Grapefruit Soda | Lime" },
    { name: "APEROL SPRITZ", description: "Aperol | Prosecco | Seltzer" },
    {
      name: "RED WINE SANGRIA",
      description: "Art Collection Cabernet Shiraz | Cranberry Juice | Fresh Fruits",
    },
    {
      name: "WHITE WINE SANGRIA",
      description: "Art Collection Sauvignon Blanc | Apple Juice | Fresh Fruits",
    },
  ];

  // Split cocktails into two columns
  const midpoint = Math.ceil(cocktails.length / 2);
  const leftColumn = cocktails.slice(0, midpoint);
  const rightColumn = cocktails.slice(midpoint);

  return (
    <section ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Content - Two Column Drink List */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <h2 className="text-primary font-display -mt-14 mb-4 text-center text-4xl md:text-5xl lg:text-left lg:text-6xl">
              Classic
              <br />
              Cocktails
            </h2>

            <div className="bg-gold mx-auto mb-6 h-px w-16 lg:mx-0"></div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {leftColumn.map((cocktail, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                      {cocktail.name}
                    </h4>
                    <p className="text-primary/70 text-md leading-relaxed italic">
                      {cocktail.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {rightColumn.map((cocktail, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                      {cocktail.name}
                    </h4>
                    <p className="text-primary/70 text-md leading-relaxed italic">
                      {cocktail.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div
              className="bg-primary relative aspect-4/5"
              style={{
                backgroundImage: "url('/background/background.png')",
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
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gold font-display mb-4 text-2xl">Classic Cocktails</h3>
                  <p className="text-background text-sm leading-relaxed">
                    Timeless favorites crafted to perfection
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

function CraftBeveragesSection() {
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

  const liqueurs = [
    { name: "LIMONCELLO" },
    { name: "LUXARDO ANGIOLETTO HAZELNUT" },
    { name: "CAMPARI" },
    { name: "COCALERO" },
    { name: "APEROL" },
    { name: "MARASCHINO LIQUEUR" },
    { name: "CONCIERGE AMARETTO" },
    { name: "LICOR 43" },
    { name: "MALIBU" },
    { name: "KAHLUA" },
    { name: "JÄGERMEISTER" },
    { name: "COINTREAU" },
    { name: "FERNET MENTA" },
    { name: "CARPANO CLASSICO" },
    { name: "CARPANO BIANCO" },
    { name: "CARPANO DRY" },
    { name: "PUNT E MES" },
    { name: "CARPANO ANTICA FORMULA" },
  ];

  const vodkas = [
    { name: "KETEL ONE" },
    { name: "ABSOLUT" },
    { name: "ABSOLUT ELYX" },
    { name: "GREY GOOSE" },
    { name: "GREY GOOSE ALTIUS" },
  ];

  // Combine both lists
  const allItems = [...liqueurs, ...vodkas];

  // Split into two columns
  const midpoint = Math.ceil(allItems.length / 2);
  const leftColumn = allItems.slice(0, midpoint);
  const rightColumn = allItems.slice(midpoint);

  return (
    <section ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Content - Image */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <div
              className="bg-primary relative aspect-4/5"
              style={{
                backgroundImage: "url('/background/background.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="border-gold flex h-full w-full items-center justify-center border-2 p-8">
                <div className="text-center">
                  <div className="border-gold mx-auto mb-6 flex h-24 w-24 items-center justify-center border-2">
                    <svg
                      className="text-gold h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gold font-display mb-4 text-2xl">Premium Spirits</h3>
                  <p className="text-background text-sm leading-relaxed">
                    Finest liqueurs and vodkas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Two Column Drink List */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <h2 className="text-primary font-display -mt-14 mb-4 text-center text-4xl md:text-5xl lg:text-left lg:text-6xl">
              Liqueur
              <br />& Vodka
            </h2>

            <div className="bg-gold mx-auto mb-6 h-px w-16 lg:mx-0"></div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {leftColumn.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                      {item.name}
                    </h4>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {rightColumn.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                      {item.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MezcalGinSection() {
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

  const mezcals = [
    { name: "400 CONEJOS" },
    { name: "EL RECUERDO" },
    { name: "FANDANGO" },
    { name: "CREYENTE MEZCAL" },
    { name: "CODIGO ARTESNAL" },
  ];

  const gins = [
    { name: "BEEFEATER" },
    { name: "BEEFEATER PINK" },
    { name: "BOMBAY SAPPHIRE" },
    { name: "TANQUERAY" },
    { name: "TANQUERAY 10" },
    { name: "MALFY LIMONE" },
    { name: "HENDRICKS" },
    { name: "HAYMAN'S SLOE GIN" },
    { name: "GIN MARE" },
    { name: "THE JODHPUR GIN" },
    { name: "THE JODHPUR MANDORE" },
    { name: "THE JODHPUR SPICY" },
    { name: "THE JODHPUR BAORI" },
    { name: "THE JODHPUR RESERVE" },
    { name: "ROKU" },
    { name: "KI NO BI" },
    { name: "MONKEY 47" },
  ];

  // Combine both lists
  const allItems = [...mezcals, ...gins];

  // Split into two columns
  const midpoint = Math.ceil(allItems.length / 2);
  const leftColumn = allItems.slice(0, midpoint);
  const rightColumn = allItems.slice(midpoint);

  return (
    <section ref={sectionRef} className="bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Content - Two Column Drink List */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <h2 className="text-primary font-display -mt-14 mb-4 text-center text-4xl md:text-5xl lg:text-left lg:text-6xl">
              Mezcal
              <br />& Gin
            </h2>

            <div className="bg-gold mx-auto mb-6 h-px w-16 lg:mx-0"></div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {leftColumn.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                      {item.name}
                    </h4>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {rightColumn.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-primary font-body text-xl leading-relaxed font-semibold">
                      {item.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div
              className="bg-primary relative aspect-4/5"
              style={{
                backgroundImage: "url('/background/background.png')",
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
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gold font-display mb-4 text-2xl">Mezcal & Gin</h3>
                  <p className="text-background text-sm leading-relaxed">
                    Artisanal spirits selection
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
