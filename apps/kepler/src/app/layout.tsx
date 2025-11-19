import type { Metadata } from "next";
import "./globals.css";
import FlowerBorder from "@/components/Hero/animations/FlowerBorder";

export const metadata: Metadata = {
  title: "Soraia - Modern Indian-European Restaurant",
  description:
    "India's first modern Indian-European restaurant with an Omakase Bar, blending Indian warmth and European sophistication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative antialiased">
        <FlowerBorder />

        {children}
      </body>
    </html>
  );
}
