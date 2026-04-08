import { Geist, Geist_Mono, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

import MainLayoutWrapper from "@/components/MainLayoutWrapper";

const jetbrainsMonoHeading = JetBrains_Mono({subsets:['latin'],variable:'--font-heading'});

const ibmPlexSans = IBM_Plex_Sans({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", ibmPlexSans.variable, jetbrainsMonoHeading.variable)}
    >
      <body className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <ThemeProvider>
                  <MainLayoutWrapper>
                    {children}
                  </MainLayoutWrapper>
                </ThemeProvider>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

