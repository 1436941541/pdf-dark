import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "PDF Dark Mode — Free Online PDF to Night Mode Converter",
  description:
    "Convert any PDF to dark mode or night mode in your browser. Free, no upload, no signup. Keeps images in original color. Download as a permanent dark PDF.",
  keywords: [
    "pdf dark mode",
    "pdf night mode",
    "dark pdf reader",
    "pdf dark mode converter",
    "read pdf at night",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    // title + description inherit from root metadata above — single source of truth.
    type: "website",
    url: "/",
    siteName: "PDF Dark",
  },
  twitter: {
    card: "summary_large_image",
    // title + description inherit from root metadata above.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://scripts.clarity.ms" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
