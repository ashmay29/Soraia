"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const HERO_IMAGES = [
  { src: "/hero/DSC00869-Edit-2.jpg", mask: "/ink-mask.png", mobileScale: "scale-[1.8]" },
  { src: "/hero/DSC00880-Edit.jpg", mask: "/ink-mask-2.png", mobileScale: "scale-[1.8]" },
  { src: "/hero/DSC00958-Edit.jpg", mask: "/ink-mask-3.png", mobileScale: "scale-[1.3]" },
  {
    src: "/hero/DSC01018-Edit.jpg",
    mask: "/ink-mask-4.png",
    mobileScale: "scale-[1.3]",
    additionalTransform: "translateX(-90px) translateY(140px) scale(0.9)", // Switching to X axis to move horizontally on screen
  },
];

export default function WatercolorHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 1. The Mask Container (Fixed Aspect Ratio) */}
      {/* Aspect ratio set to portrait (4:5) to match the vertical design */}
      <div className="relative aspect-4/5 w-full max-w-4xl md:w-[90%]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className={`absolute inset-0 h-full w-full ${HERO_IMAGES[currentIndex].mobileScale} md:scale-100`}
          >
            {/* 2. The Mask Application */}
            <div
              className="relative h-full w-full"
              style={{
                // Mask properties
                maskImage: `url('${HERO_IMAGES[currentIndex].mask}')`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: `url('${HERO_IMAGES[currentIndex].mask}')`,
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",

                // ROTATION LOGIC:
                // Rotate the container 90deg to make the horizontal ink splatter vertical
                transform: "rotate(90deg)",
              }}
            >
              {/* 3. The Image */}
              <Image
                src={HERO_IMAGES[currentIndex].src}
                alt="Soraia Interiors"
                fill
                className="object-cover"
                priority={currentIndex === 0}
                // Scale is slightly increased (1.1) to ensure no edges are cut off during rotation
                style={{
                  transform: `rotate(-90deg) scale(1) ${HERO_IMAGES[currentIndex].additionalTransform || ""}`,
                }}
              />
              {/* 4. Optional Paper Texture Overlay (Inside Mask) */}
              <div
                className="pointer-events-none absolute inset-0 z-10 bg-[url('/paper-texture.png')] bg-cover opacity-30 mix-blend-multiply"
                style={{ transform: "rotate(-90deg) scale(1)" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
