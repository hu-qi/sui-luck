import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";
import { CasinoAd } from "@/components/CasinoAd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "New Year Draw - Vibe Sui 2026",
  description: "Participate in the New Year Draw on Sui!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <CasinoAd />
        <Toaster position="bottom-center" theme="dark" />
      </body>
    </html>
  );
}
