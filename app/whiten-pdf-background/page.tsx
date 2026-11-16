import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BackgroundWorkspace } from "@/components/background-workspace";
import { Footer } from "@/components/footer";
import { IconLock, IconPalette } from "@/components/icons";
import { ToolNavigation } from "@/components/tool-navigation";
import { getSiteUrl } from "@/lib/site";

const TITLE = "Whiten PDF Background Online (Gray & Yellow Scans)";
const DESCRIPTION =
  "Whiten PDF background shading on gray or yellow scans in your browser. Preview 0-100% strength, protect colored stamps and highlights, and upload nothing.";
const SLUG = "/whiten-pdf-background";
const SOCIAL = {
  url: "/examples/background-remover/whiten-social.png",
  width: 1200,
  height: 630,
  alt: "Gray scan paper before and after PDF background whitening",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SLUG },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SLUG, type: "website", images: [SOCIAL] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SOCIAL] },
};

const inlineLink = "text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400";

const STEPS = [
  ["Open your scan locally", "Select a PDF from your device or load one of the sample scans above."],
  ["Tune strength & stamp protection", "Adjust the 0-100% slider (65% default), keep colored marks protected, or uncheck Clean page on full-page photos."],
  ["Download at 144 or 72 DPI", "Choose Sharper or Compact output and save your -whitened.pdf copy directly in the browser."],
] as const;

const SPEC_ROWS: { item: string; behavior: ReactNode; note: ReactNode }[] = [
  {
    item: "Cleaning strength (0-100% in 5% steps, default 65%)",
    behavior:
      "Estimates local paper brightness on a smoothed grid and pulls light gray or yellow backgrounds toward white; dark-background pages (brightness below 90/255) are skipped automatically.",
    note: "Raise toward 85-100% for heavier photocopy haze; step down below 50% if light pencil notes or thin serif strokes start fading.",
  },
  {
    item: "Protect colored text & marks (on by default)",
    behavior:
      "Leaves colored ink, blue or red stamps, and bright highlighter bands untouched whenever a pixel's color spread exceeds 18% relative to the surrounding paper.",
    note: "Turn off if tea stains, colored watermarks, or tinted slips scanned inside a bright white border stay uncleaned.",
  },
  {
    item: "Clean page N (per-page checkbox)",
    behavior: "Bypasses paper whitening on unchecked pages so embedded color photographs or cover sheets keep their original tones.",
    note: "Browse with Previous and Next to uncheck photo-heavy pages in a mixed document.",
  },
  {
    item: "Download quality (Sharper up to 144 DPI / Compact up to 72 DPI)",
    behavior:
      "Encodes pages locally into a new -whitened.pdf at up to 2x scale (144 DPI) or 1x scale (72 DPI), capped at 8,192 px or ~16 MP per page.",
    note: "Pick Sharper for small contract footnotes and Compact when sharing multi-page scans over email.",
  },
  {
    item: "Two-color monochrome or dark lecture slides",
    behavior: "Paper whitening keeps continuous gray shading on text and leaves dark-themed slide backgrounds unchanged.",
    note: (
      <>
        Use{" "}
        <Link href="/pdf-to-black-and-white" className={inlineLink}>
          Convert PDF to Black and White
        </Link>{" "}
        (1-254 cutoff) for strict two-color printing, or{" "}
        <Link href="/invert-pdf-colors" className={inlineLink}>
          Invert PDF Colors
        </Link>{" "}
        to flip black slides to white.
      </>
    ),
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Are sensitive contracts or ID scans uploaded to a server during cleanup?",
    a: "Never. PDF rendering and pixel whitening run inside your browser tab via a local Web Worker, so confidential contracts, tax forms, and ID scans stay on your computer with no account signup or small file-size paywall.",
  },
  {
    q: "Does this make a PDF background transparent or white out specific words?",
    a: "Neither. Every exported page has a solid opaque white backing rather than an alpha-transparent cutout, and there is no brush or redaction box for covering individual words or numbers.",
  },
  {
    q: "Will the -whitened.pdf keep selectable text, links, or lossless skipped pages?",
    a: (
      <>
        No. Every page in the download, including pages where Clean page is unchecked, is saved as a flat PNG image without OCR. Selectable text, clickable links, form fields, and digital signatures are not carried over, and born-digital PDFs can grow in byte size; if an upright English PDF needs crisp monochrome output with its existing Latin text layer preserved, use{" "}
        <Link href="/pdf-to-black-and-white" className={inlineLink}>
          Convert PDF to Black and White
        </Link>
        .
      </>
    ),
  },
];

export default function WhitenPdfBackgroundPage() {
  const url = `${getSiteUrl()}${SLUG}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Whiten PDF Background",
    url,
    description: DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <div className="flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <header className="w-full border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-2xl">🌙</span>
            <span className="whitespace-nowrap text-lg font-semibold">PDF Dark</span>
          </Link>
          <ToolNavigation active="background" />
        </div>
      </header>
      <main className="w-full flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Whiten PDF Background
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            Whiten PDF background shading on gray photocopies, yellowed book pages, and shadowy scans on your computer. Fine-tune 0% to 100% cleaning strength with a side-by-side preview, keeping blue stamps and colored highlights intact.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              0-100% live strength preview
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconPalette className="text-neutral-500" /> Protect colored stamps &amp; marks
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconLock className="text-neutral-500" /> Processed on your device (no upload)
            </span>
          </div>
        </section>
        <BackgroundWorkspace />
        <section id="how-to" className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How to whiten PDF background</h2>
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
        <section id="controls" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Controls and output specs</h2>
          <div
            role="region"
            aria-label="PDF background whitening controls and output table"
            tabIndex={0}
            className="mt-8 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            <table className="w-full min-w-[640px] text-left text-sm leading-6">
              <thead className="bg-neutral-900 text-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Setting or case</th>
                  <th scope="col" className="px-4 py-3 font-medium">How this tool handles it</th>
                  <th scope="col" className="px-4 py-3 font-medium">When to adjust or switch tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                {SPEC_ROWS.map(({ item, behavior, note }) => (
                  <tr key={item}>
                    <th scope="row" className="px-4 py-3.5 align-top font-medium text-neutral-200">{item}</th>
                    <td className="px-4 py-3.5 align-top">{behavior}</td>
                    <td className="px-4 py-3.5 align-top">{note}</td>
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
            If your scan pages are also crooked, straighten tilted text lines in{" "}
            <Link href="/deskew-pdf" className="text-amber-400 hover:underline">
              Deskew PDF
            </Link>{" "}
            before or after whitening. For night screen reading without changing the file, open the{" "}
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
