import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Khani Pini Bazar — Ahmedabad's Premium Food Marketplace",
  description: "Discover the best street food, restaurants, and cloud kitchens across Ahmedabad. Order from local vendors, track in real-time, and enjoy authentic Gujarati flavours.",
  keywords: "Ahmedabad food, street food, Gujarati food, food delivery, khana, bazar",
  openGraph: {
    title: "Khani Pini Bazar",
    description: "Ahmedabad's Premium Multi-Vendor Food Marketplace",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="overflow-x-hidden bg-[#FFF8F0]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
