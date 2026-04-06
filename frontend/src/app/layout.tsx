import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: ".prodigi | Minimalist Futuristic Digital Marketplace",
  description: "Secure, high-tech marketplace for premium digital products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.variable} ${mono.variable} font-sans min-h-screen bg-background text-foreground flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
