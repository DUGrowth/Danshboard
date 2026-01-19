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
