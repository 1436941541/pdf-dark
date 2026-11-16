import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { MonochromeWorkspace } from "@/components/monochrome-workspace";
import { Footer } from "@/components/footer";
import { ToolNavigation } from "@/components/tool-navigation";
import { IconLock } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const TITLE = "Convert PDF to Black and White (Pure B&W or Grayscale)";
const DESCRIPTION =
  "Convert PDF to black and white (pure 2-color, not grayscale) with a live 1-254 threshold preview, or keep gray tones for photos. Runs in your browser.";
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

const STEPS = [
  ["Pick your mode & PDF", "Select Pure black & white or Grayscale, then choose a local PDF or load a sample scan."],
  ["Tune the 1-254 cutoff", "Browse pages with the arrows and drag the threshold slider (128 default) beside the live preview."],
  ["Save your new copy", "Click Convert & download PDF to save a -black-and-white.pdf or -grayscale.pdf file in your browser."],
] as const;

const MODE_ROWS: { doc: string; choice: ReactNode; detail: string }[] = [
  {
    doc: "Color scans, stamped pages, or phone photos of paper",
    choice: <span className="font-medium text-neutral-100">Pure black &amp; white (1–254 slider)</span>,
    detail:
      "Forces every pixel to #000 or #FFF on your device without uploading sensitive scans. Raise or lower the cutoff to darken pale red or blue ink without blackening page edges.",
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
      <Link href="/whiten-pdf-background" className={inlineLink}>
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
      "Grayscale leaves a black slide background black and wastes toner; inversion flips dark backgrounds to white before printing.",
  },
  {
    doc: "Vector CAD drawings, fillable forms, or interactive PDFs",
    choice: <span className="text-neutral-300">Keep original vector PDF</span>,
    detail:
      "Exported pages are converted into flat bitmap images, so CAD line weights, bookmarks, clickable links, and fillable form fields are not preserved.",
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Why does Grayscale still look gray instead of pure black and white?",
    a: "Grayscale retains 256 shades from 0 to 255, so off-white scan paper and halftone background noise stay gray. Switching to Pure black & white compares every pixel's brightness against your 1–254 cutoff (128 default) and writes only #000 or #FFF.",
  },
  {
    q: "How can I make faint scanned text or pale colored lines darker?",
    a: (
      <>
        Select Pure black &amp; white and move the threshold slider upward from 128 toward 254. Higher cutoffs pull lighter gray, red, or yellow strokes into solid black; stop before binding shadows turn into dark bars, or clean uneven paper tint first in the{" "}
        <Link href="/whiten-pdf-background" className={inlineLink}>
          PDF background whitener
        </Link>
        .
      </>
    ),
  },
  {
    q: "Does PDF Dark upload my file or cap conversions per hour?",
    a: "No. Rendering and pixel conversion run inside a browser Web Worker on your computer, with no server upload, signup, or hourly task quota.",
  },
  {
    q: "Will the downloaded PDF stay searchable or shrink in file size?",
    a: "Pages are rebuilt as PNG images (up to 2x scale, capped at 8,192 px / 16 MP per page) at their original physical dimensions, with an invisible Helvetica layer re-applied for existing Latin text on upright pages. Search and copy still work on standard upright English PDFs, whereas image-only scans are not OCR'd, rotated pages and CJK text skip the text layer, and compact born-digital text PDFs can grow in byte size.",
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
            Convert PDF to black and white with strict two-color thresholding (no shades of gray) for scans, or choose grayscale to keep photo and chart tones. Tune the 1–254 slider with a live side-by-side page preview before you export.
          </p>
          <div className="mb-8 mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              1–254 live threshold preview
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconLock className="text-neutral-500" /> Processed on your device (no upload)
            </span>
            <span className="rounded-full border border-neutral-800 px-3 py-1">No hourly cap or signup</span>
          </div>
        </section>
        <MonochromeWorkspace />
        <section id="how-to" className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How to convert PDF to black and white</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
                <span className="font-mono text-sm text-amber-400">0{i + 1}</span>
                <h3 className="mt-2 font-semibold text-neutral-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section id="mode-guide" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Choosing between two-color, grayscale, and other tools</h2>
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
            If your scan pages are crooked, straighten them in{" "}
            <Link href="/deskew-pdf" className="text-amber-400 hover:underline">
              Deskew PDF
            </Link>{" "}
            first. For night screen reading instead of printing, open the{" "}
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
