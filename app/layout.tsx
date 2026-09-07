/* eslint-disable @next/next/google-font-display */
/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dapoer Iboe — Catering Harian Premium & Tracking Pesanan",
  description: "Layanan catering harian dengan menu rumahan berkualitas. Pesan langganan catering Siang & Malam dengan pengantaran tepat waktu dan tracking pesanan transparan.",
  keywords: "catering, catering harian, catering langganan, dapoer iboe, makanan rumahan, tracking pesanan catering",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#B8421E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FCF8F6] text-[#221916] antialiased selection:bg-orange-200 selection:text-orange-950">
        {children}
      </body>
    </html>
  );
}
