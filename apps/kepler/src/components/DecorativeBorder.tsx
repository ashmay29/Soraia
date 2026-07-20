"use client";

import { usePathname } from "next/navigation";
import FlowerBorder from "@/components/Hero/animations/FlowerBorder";

/**
 * The decorative flower line-art belongs on the marketing site, not on the internal
 * payment tool or the customer pay pages — there it floats over the text and hurts
 * readability. Render it everywhere EXCEPT those routes.
 */
export default function DecorativeBorder() {
  const pathname = usePathname();
  if (pathname?.startsWith("/staff") || pathname?.startsWith("/pay")) return null;
  return <FlowerBorder />;
}
