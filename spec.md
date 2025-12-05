Here is the updated, highly detailed Technical Specification. You can copy this entire block and paste it directly into your AI coding assistant (Cursor, GitHub Copilot, or ChatGPT).

It includes the **new "Ink Spread" animation logic** (Scale + Blur) instead of the simple fade.

---

# Technical Specification: "Ink Spread" Watercolor Hero Component

## 1\. Project Context

- **Project Name:** Soraia (Neo-Botanical Restaurant Website)
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Animation Library:** Framer Motion
- **Visual Goal:** Replicate a "wet ink" reveal effect where images appear to bleed onto paper, rather than a digital fade.

## 2\. Asset Requirements

**Action:** Ensure the following files are placed in the `/public` directory before coding:

1.  **`ink-mask.png`**: A black ink blot shape with a **transparent background** (User has verified this exists).
2.  **`paper-texture.jpg`**: A seamless, off-white watercolor paper texture.
3.  **Images**: High-resolution restaurant photos (e.g., `/images/hero-1.jpg`, etc.).

## 3\. Component Architecture (`WatercolorHero.tsx`)

### A. The Masking Strategy

- **Method:** CSS Masking (`mask-image`).
- **Logic:** The component uses a `<div>` shaped by the `ink-mask.png`.
- **Orientation Handling:**
  - The `mask-image` container is rotated `90deg` (to make the horizontal ink blot vertical).
  - The inner `Next/Image` is counter-rotated `-90deg` so the photo remains upright.

### B. The "Ink Spread" Animation

Instead of a simple opacity fade, we use a 3-prop transition to mimic liquid physics:

1.  **Scale:** Starts at `0.85` (small pool of ink) $\rightarrow$ Expands to `1.0` (soaks into paper).
2.  **Blur:** Starts at `10px` (fuzzy wet edges) $\rightarrow$ Sharpens to `0px` (dry).
3.  **Opacity:** `0` $\rightarrow$ `1`.

## 4\. Implementation Code

**File Path:** `components/hero/WatercolorHero.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// TODO: Replace with actual asset paths from the Soraia project
const HERO_IMAGES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];

export default function WatercolorHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate images every 6 seconds (Slow timing for relaxed vibe)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#Fdfbf7]">
      {/* 1. Main Composition Container 
          Aspect Ratio: 4:5 (Vertical/Portrait) to match the Annabel's style video.
          Max-Width: Controlled to ensure it doesn't span the whole desktop width.
      */}
      <div className="relative aspect-[4/5] w-[90%] max-w-2xl">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            // === ANIMATION: THE INK SPREAD EFFECT ===
            // Start: Slightly smaller, transparent, and blurry (wet ink)
            initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
            // End: Full size, sharp, and opaque (dried on paper)
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            // Exit: Continues expanding slightly while fading out (dissolving)
            exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
            // Timing: Slow, non-linear ease to mimic liquid friction
            transition={{
              duration: 2.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute inset-0 h-full w-full"
          >
            {/* 2. Mask Container */}
            <div
              className="relative h-full w-full"
              style={{
                // Standard & Webkit Mask Properties
                maskImage: "url('/ink-mask.png')",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url('/ink-mask.png')",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",

                // Rotates the mask frame to be vertical
                transform: "rotate(90deg)",
              }}
            >
              {/* 3. The Image */}
              <Image
                src={HERO_IMAGES[currentIndex]}
                alt="Soraia Atmosphere"
                fill
                className="object-cover"
                priority={currentIndex === 0}
                // Counter-rotates the image to keep it upright.
                // Scale 1.2 ensures the image fills the corners during rotation.
                style={{ transform: "rotate(-90deg) scale(1.2)" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 4. Texture Overlay 
            This sits ON TOP of the image to texturize the shadows.
            mix-blend-multiply is essential here.
        */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-50 mix-blend-multiply"
          style={{
            backgroundImage: "url('/paper-texture.jpg')",
            backgroundSize: "400px", // Adjust grain size
            backgroundRepeat: "repeat",
          }}
        />
      </div>
    </section>
  );
}
```

## 5\. Next Steps for Developer

1.  **Install Dependencies:** Run `npm install framer-motion clsx tailwind-merge` if not already present.
2.  **Verify Assets:** Ensure `ink-mask.png` is transparent (not white background).
3.  **Import:** Add `<WatercolorHero />` to the main `page.tsx`.
4.  **Fine Tuning:** \* If the ink spreads too fast, increase `duration` to `3.0`.
    - If the paper texture is too dark, lower `opacity-50` to `opacity-30`.
