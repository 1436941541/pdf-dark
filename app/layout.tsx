import type { Metadata } from "next";
import { headers } from "next/headers";
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
  title: "PDF Dark Mode — Free Online Dark Mode PDF Reader | PDF Dark",
  description:
    "Read any PDF in dark mode or night mode right in your browser. Free, no upload, no signup. Need to keep it? Convert and download a permanent dark PDF.",
  keywords: [
    "pdf dark mode",
    "pdfdark",
    "pdf night mode",
    "dark pdf reader",
    "pdf dark mode converter",
    "read pdf at night",
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
      pt: "/pt",
      "x-default": "/",
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set by middleware.ts from the URL's first path segment ("es"/"pt"),
  // "en" for everything else including the unprefixed English routes.
  const htmlLang = (await headers()).get("x-html-lang") ?? "en";

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
