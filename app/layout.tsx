import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Toaster } from "react-hot-toast";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dan-shboard - ADHD Productivity Gamified",
  description: "Your personal productivity and gamification system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dan-shboard",
  },
  icons: {
    apple: [
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  themeColor: "#141414",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${lora.variable} font-sans`}>
        <NavBar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "bg-card text-card-foreground border border-border",
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
