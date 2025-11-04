import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
