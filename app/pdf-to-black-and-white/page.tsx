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
  "Convert PDF to black and white online (pure 2-color, not grayscale) with a live 1-254 threshold preview for scanned PDFs and printing, or use grayscale.";
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
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SLUG,
    type: "website",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

const inlineLink =
  "text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400";

const STEPS = [
  [
    "Choose mode & PDF",
    "Keep Pure black & white for scans or switch to Grayscale, then drop a PDF or load a sample.",
  ],
  [
    "Check the 1-254 cutoff",
    "Flip pages with the arrows and drag the threshold slider (128 default) with the live side-by-side preview.",
  ],
  [
    "Export your copy",
    "Click Convert & download PDF to save a -black-and-white.pdf or -grayscale.pdf file locally.",
  ],
] as const;

const MODE_ROWS: { doc: string; choice: ReactNode; detail: string }[] = [
  {
    doc: "Color scans, stamped forms, or phone photos of paper",
    choice: (
      <span className="font-medium text-neutral-100">
        Pure black &amp; white
      </span>
    ),
    detail:
      "Turns off-white paper pure white and colored ink solid black for high-contrast printing or e-ink reading.",
  },
  {
    doc: "Reports with portraits, gradients, or shaded charts",
    choice: <span className="font-medium text-neutral-100">Grayscale</span>,
    detail:
      "Maps colors by perceived brightness (0.299R + 0.587G + 0.114B) so photo shading survives; preview series that share similar brightness.",
  },
  {
    doc: "Uneven yellow or gray scan paper with faint writing",
    choice: (
      <Link href="/whiten-pdf-background" className={inlineLink}>
        Whiten PDF background
      </Link>
    ),
    detail:
      "Evens out local paper illumination when one global threshold cannot separate light pencil or faded ink from dark binding shadows.",
  },
  {
    doc: "Dark-background lecture slides or notes for printing",
    choice: (
      <Link href="/invert-pdf-colors" className={inlineLink}>
        Invert PDF colors
      </Link>
    ),
    detail:
      "Both modes here leave black backgrounds black; switch to Dark → Light (Print) there to flip dark slides to pure #FFF white (-light.pdf) and save toner.",
  },
  {
    doc: "Vector CAD drawings, clickable links, or fillable forms",
    choice: (
      <span className="text-neutral-300">Keep original vector PDF</span>
    ),
    detail:
      "Exported pages are rasterized into flat bitmap images, so CAD line weights, bookmarks, links, and interactive form fields are not kept.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Why do "Print as black and white" and grayscale tools leave a gray tint on scans, and how do I darken faint ink?',
    a: "System print dialogs and standard grayscale converters map off-white scan paper to light gray (around 230–245 luminance), which prints as halftone dots. Pure black & white snaps every pixel below your cutoff to #000 and everything at or above it to #FFF: nudge the slider upward from 128 toward 254 to pull pale red, yellow, or faded strokes into solid black, stopping just before margin shadows thicken.",
  },
  {
    q: "Are files uploaded to a server, or is there a page or hourly limit?",
    a: "Nothing leaves your browser: page rendering and PDF assembly run locally in your tab while pixel conversion runs in a background Web Worker. There is no server upload, watermark, or hourly task cap; the tool converts one unencrypted PDF at a time, bounded only by your device's available memory.",
  },
  {
    q: "Does converting a PDF to black and white reduce file size or keep text selectable?",
    a: "Each page is exported as a PNG image (up to 2x scale, capped at 8,192 px per side and 16 MP per page) at its original physical dimensions, with an invisible Helvetica text layer re-applied on upright pages. Standard Latin text remains selectable and searchable, whereas rotated pages, vertical text, and non-Latin scripts (such as CJK) skip the text layer, image-only scans are not OCR'd, and compact born-digital text PDFs can grow in file size.",
  },
];

export default function BlackAndWhitePage() {
  const site = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to Black and White Converter",
    url: `${site}${SLUG}`,
    screenshot: `${site}/examples/black-and-white/bw190-4.png`,
    description: DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <div className="flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <header className="w-full border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">
              PDF Dark
            </span>
          </Link>
          <ToolNavigation active="monochrome" />
        </div>
      </header>
      <main className="w-full flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Convert PDF to
            <br className="sm:hidden" /> Black and White
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            Convert PDF to black and white for crisp printing and scanned PDFs
            with strict two-color thresholding (no shades of gray), or switch to
            grayscale to keep photo and chart tones. Preview every page side by
            side as you drag the 1–254 cutoff.
          </p>
          <div className="mb-8 mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              1–254 live threshold preview
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconLock className="text-neutral-500" /> Processed on your device
            </span>
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              Free, no signup
            </span>
          </div>
        </section>
        <MonochromeWorkspace />
        <section
          id="how-to"
          className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12"
        >
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            How to convert PDF to black and white
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li
                key={title}
                className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"
              >
                <span className="font-mono text-sm text-amber-400">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-semibold text-neutral-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section
          id="mode-guide"
          className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12"
        >
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Choosing between two-color, grayscale, and sibling tools
          </h2>
          <div
            role="region"
            aria-label="PDF black and white mode selection table"
            tabIndex={0}
            className="mt-8 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            <table className="w-full min-w-[640px] text-left text-sm leading-6">
              <thead className="bg-neutral-900 text-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Your PDF
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Best choice
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    What to expect
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                {MODE_ROWS.map(({ doc, choice, detail }) => (
                  <tr key={doc}>
                    <th
                      scope="row"
                      className="px-4 py-3.5 align-top font-medium text-neutral-200"
                    >
                      {doc}
                    </th>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {choice}
                    </td>
                    <td className="px-4 py-3.5 align-top">{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section
          id="faq"
          className="mx-auto max-w-3xl border-t border-neutral-900 px-6 py-12 pb-16"
        >
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60"
              >
                <summary className="cursor-pointer p-4 font-medium text-neutral-100">
                  {q}
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">
                  {a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            If your scan pages are tilted, straighten them first in{" "}
            <Link href="/deskew-pdf" className="text-amber-400 hover:underline">
              Deskew PDF
            </Link>
            . To read on a screen at night instead of printing, open the{" "}
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
