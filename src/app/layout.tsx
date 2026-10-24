import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hayday",
  description:
    "Take a photo of your pay stub. Hayday checks if you were paid correctly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <SiteHeader />
          <main className="flex-1 py-8">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
