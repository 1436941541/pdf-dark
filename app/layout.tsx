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

// Google AdSense 发布商 ID（2026-10-24 账号审核通过，和 public/ads.txt 里的一致）。
// 广告位置由 AdSense 后台的「自动广告」决定，这里只加载脚本。
const ADSENSE_CLIENT = "ca-pub-6429027443057424";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "PDF Dark Mode — Free Online Dark Mode PDF Reader | PDF Dark",
  description:
    "Read any PDF in dark mode or night mode right in your browser. Free, no upload, no signup. Need to keep it? Convert and download a permanent dark PDF.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
      pt: "/pt",
      de: "/de",
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
  // AdSense 认领网站用的 meta（google-adsense-account）
  other: { "google-adsense-account": ADSENSE_CLIENT },
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
      {/* AdSense 要求脚本放在每个页面的 <head> 里：用原生 script 由服务端直接输出，
          不用 next/script（它会加 data-nscript 属性，AdSense 会报不支持） */}
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
