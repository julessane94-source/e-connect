"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import WelcomeMarquee from "@/components/WelcomeMarquee";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/ChatAssistant";
import { usePathname } from "next/navigation";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Cacher navbar et footer sur les pages auth
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {!isAuthPage && <Navbar />}
          <main className={!isAuthPage ? "min-h-screen pt-20" : ""}>
            <WelcomeMarquee />
            {children}
          </main>
          {!isAuthPage && <Footer />}
          <ChatAssistant />
        </Providers>
      </body>
    </html>
  );
}

