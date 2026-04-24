import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PDF Dark Mode — Convert Any PDF to Night Mode Online (Free, No Upload)",
  description:
    "Instantly convert PDFs to dark mode in your browser. 100% private—no upload, no signup. Keeps images original, download as a new PDF. Better than Chrome extensions.",
  keywords: [
    "pdf dark mode",
    "pdf night mode",
    "dark pdf reader",
    "pdf dark mode converter",
    "read pdf at night",
  ],
  openGraph: {
    title: "PDF Dark Mode — Free Online Converter",
    description:
      "Convert PDFs to dark mode. 100% browser-side. Download the dark version.",
    type: "website",
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
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
