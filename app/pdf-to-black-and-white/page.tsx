import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MonochromeWorkspace } from "@/components/monochrome-workspace";
import { Footer } from "@/components/footer";
import { ToolNavigation } from "@/components/tool-navigation";
import { IconLock, IconDownload } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const TITLE = "Convert PDF to Black and White (Pure B&W or Grayscale)";
const DESCRIPTION =
  "Convert a color PDF to pure black and white (not grayscale) with a 1-254 threshold preview, or keep gray tones for photos. Runs in your browser.";
const SLUG = "/pdf-to-black-and-white";
const SOCIAL_IMAGE = {
  url: `${SLUG}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: "Convert PDF to Black and White: original, grayscale and pure black-and-white comparison",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SLUG },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SLUG, type: "website", images: [SOCIAL_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

const inlineLink = "text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400";

const MODE_ROWS: { doc: string; choice: ReactNode; detail: string }[] = [
  {
    doc: "Color scans, stamped pages, or phone photos of paper",
    choice: <span className="font-medium text-neutral-100">Pure black &amp; white (1–254 slider)</span>,
    detail:
      "Forces every pixel to #000 or #FFF on your device without uploading sensitive scans. Use the side-by-side preview to darken pale red or blue ink without blackening page edges.",
  },
  {
    doc: "Reports with photos, gradients, or shaded charts",
    choice: <span className="font-medium text-neutral-100">Grayscale</span>,
    detail:
      "Maps color to 256 gray levels (0.299R + 0.587G + 0.114B) so portraits and gradients keep tonal depth. Check the preview where red and green chart series share similar brightness.",
  },
  {
    doc: "Yellowed or gray scan paper with faint writing",
    choice: (
      <Link href="/whiten-pdf" className={inlineLink}>
        Whiten PDF background
      </Link>
    ),
    detail:
      "Cleans uneven paper tint when a single global cutoff cannot separate light pencil or faded ink from dark binding shadows.",
  },
  {
    doc: "Dark-background slides or lecture notes for printing",
    choice: (
      <Link href="/invert-pdf-colors" className={inlineLink}>
        Invert PDF colors
      </Link>
    ),
    detail:
      "Grayscale leaves a black slide background black and burns toner; inversion flips dark backgrounds to white before printing.",
  },
  {
    doc: "Vector CAD drawings, fillable forms, or strict size limits",
    choice: <span className="text-neutral-300">Keep original or use a vector tool</span>,
    detail:
      "This converter rasterizes pages to PNG (up to 2x scale, 16 MP per page), which drops links, form fields, and vector sharpness and can make compact text PDFs larger.",
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "How do I convert a PDF to pure black and white, not grayscale?",
    a: "Select Pure black & white before exporting. Grayscale keeps 256 shades of gray, so pale paper tint and scan noise stay gray; two-color mode compares each pixel's 0–255 brightness against your cutoff (default 128) and writes only #000 or #FFF, saving the copy with a -black-and-white.pdf suffix.",
  },
  {
    q: "How can I make faint scanned text or pale colored lines darker?",
    a: (
      <>
        Switch to Pure black &amp; white and drag the threshold slider upward from 128 toward 254 while checking the side-by-side preview across representative pages. Higher cutoffs pull lighter gray, red, or yellow strokes into black; stop before binding shadows turn into solid blocks, or lift uneven paper tint first in the{" "}
        <Link href="/whiten-pdf" className={inlineLink}>
          PDF background whitener
        </Link>
        .
      </>
    ),
  },
  {
    q: "Does PDF Dark upload my file, or limit tasks per hour?",
    a: "No. Conversion runs inside a browser Web Worker on your device with no server upload and no hourly task cap. This page processes one unencrypted PDF at a time across all its pages, so capacity depends on your browser's available memory rather than a server upload limit.",
  },
  {
    q: "Will the downloaded PDF stay searchable, keep clickable links, or shrink in size?",
    a: "Each page is rebuilt as a PNG image (up to 2x scale, 8192 px max side) at its original page dimensions, with an invisible Helvetica text layer re-applied for non-rotated Latin text. Search and copy still work on standard English PDFs, whereas image-only scans are not OCR'd, CJK and rotated text layers are skipped, clickable links, bookmarks, and form fields are dropped, and compact vector-text PDFs can grow in file size.",
  },
];

export default function BlackAndWhitePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to Black and White Converter",
    url: `${getSiteUrl()}${SLUG}`,
    description: DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <div className="flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <header className="w-full border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">PDF Dark</span>
          </Link>
          <ToolNavigation active="monochrome" />
        </div>
      </header>
      <main className="w-full flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Convert PDF to<br className="sm:hidden" /> Black and White
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            Convert PDF to black and white with strict two-color thresholding (no shades of gray) for scans, or choose grayscale to keep photo and chart tones. Tune the 1–254 slider against a live side-by-side page preview before you export.
          </p>
          <div className="mb-8 mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconDownload className="text-neutral-500" /> 1–254 live threshold preview
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconLock className="text-neutral-500" /> Processed in your browser (no upload)
            </span>
            <span className="rounded-full border border-neutral-800 px-3 py-1">No hourly cap or signup</span>
          </div>
        </section>
        <MonochromeWorkspace />
        <section id="mode-guide" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Choosing a PDF to black and white mode</h2>
          <div
            role="region"
            aria-label="PDF black and white mode selection table"
            tabIndex={0}
            className="mt-8 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            <table className="w-full min-w-[640px] text-left text-sm leading-6">
              <thead className="bg-neutral-900 text-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Your PDF</th>
                  <th scope="col" className="px-4 py-3 font-medium">Best choice</th>
                  <th scope="col" className="px-4 py-3 font-medium">Why &amp; what to expect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                {MODE_ROWS.map(({ doc, choice, detail }) => (
                  <tr key={doc}>
                    <th scope="row" className="px-4 py-3.5 align-top font-medium text-neutral-200">{doc}</th>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">{choice}</td>
                    <td className="px-4 py-3.5 align-top">{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id="faq" className="mx-auto max-w-3xl border-t border-neutral-900 px-6 py-12 pb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60">
                <summary className="cursor-pointer p-4 font-medium text-neutral-100">{q}</summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            Tilted scan? Straighten pages with{" "}
            <Link href="/deskew-pdf" className="text-amber-400 hover:underline">
              Deskew PDF
            </Link>{" "}
            first. Reading on screen instead of printing? Open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
